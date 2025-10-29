const { validationResult } = require('express-validator');
const jwt = require('jsonwebtoken');
const userService = require('../services/userService');
const { validateRolePermissions } = require('../helpers/authHelpers');

// Función auxiliar para manejar errores de validación
const handleValidationErrors = (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Errores de validación',
      errors: errors.array().map(error => ({
        field: error.path,
        message: error.msg
      }))
    });
  }
  return null;
};

// @desc    Registrar usuario
// @route   POST /api/auth/register
// @access  Public
const register = async (req, res) => {
  try {
    // Validar errores
    const validationError = handleValidationErrors(req, res);
    if (validationError) return validationError;

    const { email, password, firstName, lastName, role, phone, dni, nivel, condicion, especialidades, tarifaPorHora, disponibilidad } = req.body;

    // Verificar si el usuario ya existe
    const existingUser = await userService.findUserByEmail(email);
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Ya existe un usuario con este email',
        code: 'USER_EXISTS'
      });
    }

    // Validar permisos de rol
    const roleValidation = await validateRolePermissions(role, req.header('Authorization'));
    if (!roleValidation.isValid) {
      return res.status(403).json({
        success: false,
        message: roleValidation.error,
        code: roleValidation.code
      });
    }

    // Crear usuario usando el service
    const userData = {
      email: email.toLowerCase(),
      firstName,
      lastName,
      role: role || 'estudiante',
      phone
    };

    // Manejar password según el rol
    if (role === 'admin') {
      // Admin usa password proporcionado
      userData.password = password;
      userData.mustChangePassword = false;
    } else {
      // Estudiante/Profesor usa DNI como password temporal
      if (!dni) {
        return res.status(400).json({
          success: false,
          message: 'DNI es requerido para estudiantes y profesores',
          code: 'DNI_REQUIRED'
        });
      }
      userData.password = dni; // El modelo se encargará del hash
      userData.dni = dni;
      userData.mustChangePassword = true;
    }

    // Agregar campos específicos según el rol
    if (role === 'estudiante') {
      if (nivel) userData.nivel = nivel;
      if (condicion) userData.condicion = condicion;
    } else if (role === 'profesor') {
      if (especialidades) userData.especialidades = especialidades;
      if (tarifaPorHora) userData.tarifaPorHora = tarifaPorHora;
      if (disponibilidad) userData.disponibilidad = disponibilidad;
    }

    const user = await userService.createUser(userData);

    // Generar token
    const token = userService.generateToken(user._id);

    // Respuesta exitosa
    res.status(201).json({
      success: true,
      message: 'Usuario registrado exitosamente',
      data: {
        token,
        user: user.toJSON()
      }
    });

  } catch (error) {
    console.error('Error en register:', error);
    
    // Error de duplicado de MongoDB
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Ya existe un usuario con este email',
        code: 'DUPLICATE_EMAIL'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      code: 'INTERNAL_ERROR'
    });
  }
};

// @desc    Login usuario
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res) => {
  try {
    // Validar errores
    const validationError = handleValidationErrors(req, res);
    if (validationError) return validationError;

    const { email, password } = req.body;

    // Buscar usuario
    const user = await userService.findUserByEmail(email);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Credenciales inválidas',
        code: 'INVALID_CREDENTIALS'
      });
    }

    // Verificar que está activo
    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Cuenta desactivada',
        code: 'ACCOUNT_DISABLED'
      });
    }

    // Verificar password
    const isPasswordValid = await userService.validatePassword(user, password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Credenciales inválidas',
        code: 'INVALID_CREDENTIALS'
      });
    }

    // Verificar si debe cambiar password
    if (user.mustChangePassword) {
      // Generar token temporal para cambio de password
      const token = userService.generateToken(user._id);
      
      return res.status(200).json({
        success: true,
        message: 'Debe cambiar su contraseña',
        data: {
          token,
          user: user.toJSON(),
          mustChangePassword: true
        }
      });
    }

    // Actualizar último login
    user.lastLogin = new Date();
    await user.save();

    // Generar token
    const token = userService.generateToken(user._id);

    res.json({
      success: true,
      message: 'Login exitoso',
      data: {
        token,
        user: user.toJSON()
      }
    });

  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      code: 'INTERNAL_ERROR'
    });
  }
};

// @desc    Obtener perfil del usuario autenticado
// @route   GET /api/auth/profile
// @access  Private
const getProfile = async (req, res) => {
  try {
    const user = await userService.getUserProfile(req.user.userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado',
        code: 'USER_NOT_FOUND'
      });
    }

    res.json({
      success: true,
      data: {
        user: user.toJSON()
      }
    });

  } catch (error) {
    console.error('Error en getProfile:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      code: 'INTERNAL_ERROR'
    });
  }
};

// @desc    Actualizar perfil del usuario
// @route   PUT /api/auth/profile
// @access  Private
const updateProfile = async (req, res) => {
  try {
    // Validar errores
    const validationError = handleValidationErrors(req, res);
    if (validationError) return validationError;

    const { firstName, lastName, phone } = req.body;
    const userId = req.user.userId;

    // Buscar usuario
    const user = await userService.getUserProfile(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado',
        code: 'USER_NOT_FOUND'
      });
    }

    // Actualizar campos permitidos
    if (firstName) user.firstName = firstName;
    if (lastName) user.lastName = lastName;
    if (phone !== undefined) user.phone = phone; // Permitir string vacío

    await user.save();

    res.json({
      success: true,
      message: 'Perfil actualizado exitosamente',
      data: {
        user: user.toJSON()
      }
    });

  } catch (error) {
    console.error('Error en updateProfile:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      code: 'INTERNAL_ERROR'
    });
  }
};

// @desc    Cambiar contraseña
// @route   PUT /api/auth/change-password
// @access  Private
const changePassword = async (req, res) => {
  try {
    // Validar errores
    const validationError = handleValidationErrors(req, res);
    if (validationError) return validationError;

    const { currentPassword, newPassword } = req.body;
    const userId = req.user.userId;

    // Buscar usuario con password
    const { BaseUser } = require('../models');
    const user = await BaseUser.findById(userId).select('+password');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado',
        code: 'USER_NOT_FOUND'
      });
    }

    // Verificar password actual
    const isCurrentPasswordValid = await userService.validatePassword(user, currentPassword);
    if (!isCurrentPasswordValid) {
      return res.status(400).json({
        success: false,
        message: 'Contraseña actual incorrecta',
        code: 'INVALID_CURRENT_PASSWORD'
      });
    }

    // Actualizar password
    user.password = newPassword;
    await user.save();

    res.json({
      success: true,
      message: 'Contraseña actualizada exitosamente'
    });

  } catch (error) {
    console.error('Error en changePassword:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      code: 'INTERNAL_ERROR'
    });
  }
};

// @desc    Logout (invalidar token - para implementación futura)
// @route   POST /api/auth/logout
// @access  Private
const logout = async (req, res) => {
  try {
    // Por ahora solo devolvemos éxito
    // En una implementación real, podrías mantener una blacklist de tokens
    res.json({
      success: true,
      message: 'Logout exitoso'
    });

  } catch (error) {
    console.error('Error en logout:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      code: 'INTERNAL_ERROR'
    });
  }
};

// @desc    Obtener estudiantes con filtros
// @route   GET /api/auth/students
// @access  Private (Admin/Profesor)
const getStudents = async (req, res) => {
  try {
    const { nivel, condicion, page = 1, limit = 10 } = req.query;
    
    // Construir filtros
    const filters = { role: 'estudiante' };
    if (nivel) filters.nivel = nivel;
    if (condicion) filters.condicion = condicion;
    
    // Paginación
    const skip = (page - 1) * limit;
    
    const students = await userService.findUsersWithFilters(filters, skip, parseInt(limit));
    const total = await userService.countUsersWithFilters(filters);
    
    res.json({
      success: true,
      data: {
        students,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });

  } catch (error) {
    console.error('Error en getStudents:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      code: 'INTERNAL_ERROR'
    });
  }
};

// @desc    Obtener profesores con filtros
// @route   GET /api/auth/professors
// @access  Private (Admin)
const getProfessors = async (req, res) => {
  try {
    const { especialidad, page = 1, limit = 10 } = req.query;
    
    // Construir filtros
    const filters = { role: 'profesor' };
    if (especialidad) filters.especialidades = { $in: [especialidad] };
    
    // Paginación
    const skip = (page - 1) * limit;
    
    const professors = await userService.findUsersWithFilters(filters, skip, parseInt(limit));
    const total = await userService.countUsersWithFilters(filters);
    
    res.json({
      success: true,
      data: {
        professors,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });

  } catch (error) {
    console.error('Error en getProfessors:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      code: 'INTERNAL_ERROR'
    });
  }
};

// @desc    Actualizar información académica (estudiantes)
// @route   PUT /api/auth/update-academic-info
// @access  Private (Estudiante)
const updateAcademicInfo = async (req, res) => {
  try {
    const validationError = handleValidationErrors(req, res);
    if (validationError) return validationError;

    const userId = req.user.id;
    const { nivel, condicion } = req.body;

    // Verificar que el usuario es estudiante
    const user = await userService.findUserById(userId);
    if (user.role !== 'estudiante') {
      return res.status(403).json({
        success: false,
        message: 'Solo los estudiantes pueden actualizar información académica',
        code: 'UNAUTHORIZED_ROLE'
      });
    }

    const updateData = {};
    if (nivel) updateData.nivel = nivel;
    if (condicion) updateData.condicion = condicion;

    const updatedUser = await userService.updateUser(userId, updateData);

    res.json({
      success: true,
      message: 'Información académica actualizada exitosamente',
      data: {
        user: updatedUser.toJSON()
      }
    });

  } catch (error) {
    console.error('Error en updateAcademicInfo:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      code: 'INTERNAL_ERROR'
    });
  }
};

// @desc    Actualizar información de enseñanza (profesores)
// @route   PUT /api/auth/update-teaching-info
// @access  Private (Profesor)
const updateTeachingInfo = async (req, res) => {
  try {
    const validationError = handleValidationErrors(req, res);
    if (validationError) return validationError;

    const userId = req.user.id;
    const { especialidades, tarifaPorHora, disponibilidad } = req.body;

    // Verificar que el usuario es profesor
    const user = await userService.findUserById(userId);
    if (user.role !== 'profesor') {
      return res.status(403).json({
        success: false,
        message: 'Solo los profesores pueden actualizar información de enseñanza',
        code: 'UNAUTHORIZED_ROLE'
      });
    }

    const updateData = {};
    if (especialidades) updateData.especialidades = especialidades;
    if (tarifaPorHora) updateData.tarifaPorHora = tarifaPorHora;
    if (disponibilidad) updateData.disponibilidad = disponibilidad;

    const updatedUser = await userService.updateUser(userId, updateData);

    res.json({
      success: true,
      message: 'Información de enseñanza actualizada exitosamente',
      data: {
        user: updatedUser.toJSON()
      }
    });

  } catch (error) {
    console.error('Error en updateTeachingInfo:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      code: 'INTERNAL_ERROR'
    });
  }
};

// @desc    Cambiar contraseña forzado (primera vez)
// @route   POST /api/auth/change-password-forced
// @access  Private
const changePasswordForced = async (req, res) => {
  try {
    // Validar errores
    const validationError = handleValidationErrors(req, res);
    if (validationError) return validationError;

    const { newPassword } = req.body;
    const userId = req.user.userId;

    // Buscar usuario
    const user = await userService.findUserById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado',
        code: 'USER_NOT_FOUND'
      });
    }

    // Verificar que debe cambiar password
    if (!user.mustChangePassword) {
      return res.status(400).json({
        success: false,
        message: 'No es necesario cambiar la contraseña',
        code: 'PASSWORD_CHANGE_NOT_REQUIRED'
      });
    }

    // Actualizar password y marcar como cambiado
    const updateData = {
      password: newPassword,
      mustChangePassword: false
    };

    const updatedUser = await userService.updateUser(userId, updateData);

    // Generar nuevo token
    const token = userService.generateToken(user._id);

    res.json({
      success: true,
      message: 'Contraseña cambiada exitosamente',
      data: {
        token,
        user: updatedUser.toJSON()
      }
    });

  } catch (error) {
    console.error('Error en changePasswordForced:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      code: 'INTERNAL_ERROR'
    });
  }
};

module.exports = {
  register,
  login,
  getProfile,
  updateProfile,
  changePassword,
  changePasswordForced,
  logout,
  getStudents,
  getProfessors,
  updateAcademicInfo,
  updateTeachingInfo
};
