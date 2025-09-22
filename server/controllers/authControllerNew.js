const { validationResult } = require('express-validator');
const jwt = require('jsonwebtoken');
const { BaseUser, Estudiante, Profesor, Admin, getUserModel, findUserByEmail, findUserById } = require('../models');

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

// Función para generar JWT token
const generateToken = (userId) => {
  return jwt.sign(
    { id: userId },
    process.env.JWT_SECRET || 'mi_clave_secreta',
    { expiresIn: '24h' }
  );
};

// Función para validar permisos de registro
const validateRegistrationPermissions = (role, authHeader) => {
  // Solo admins pueden registrar profesores y otros admins
  if (role === 'profesor' || role === 'admin') {
    if (!authHeader) {
      return {
        isValid: false,
        error: `Solo los administradores pueden crear ${role}s`,
        code: 'INSUFFICIENT_PERMISSIONS'
      };
    }
  }
  return { isValid: true };
};

// @desc    Registrar usuario
// @route   POST /api/auth/register
// @access  Depends on role
const register = async (req, res) => {
  try {
    // Validar errores
    const validationError = handleValidationErrors(req, res);
    if (validationError) return validationError;

    const { 
      email, 
      password, 
      firstName, 
      lastName, 
      role = 'estudiante', 
      phone, 
      dni,
      // Campos específicos por rol
      nivel, 
      estadoAcademico,
      especialidades, 
      tarifaPorHora, 
      disponibilidad,
      permisos
    } = req.body;

    // Verificar si el usuario ya existe
    const existingUser = await findUserByEmail(email);
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Ya existe un usuario con este email',
        code: 'USER_EXISTS'
      });
    }

    // Verificar si el DNI ya existe (si se proporciona)
    if (dni) {
      const existingDni = await BaseUser.findOne({ dni });
      if (existingDni) {
        return res.status(400).json({
          success: false,
          message: 'Ya existe un usuario con este DNI',
          code: 'DNI_EXISTS'
        });
      }
    }

    // Validar permisos de registro
    const permissionCheck = validateRegistrationPermissions(role, req.header('Authorization'));
    if (!permissionCheck.isValid) {
      return res.status(403).json({
        success: false,
        message: permissionCheck.error,
        code: permissionCheck.code
      });
    }

    // Preparar datos base
    const baseUserData = {
      email,
      password: password || dni, // Para estudiantes/profesores, password inicial es DNI
      firstName,
      lastName,
      role,
      phone,
      dni
    };

    // Crear usuario según el rol
    let newUser;
    
    switch (role) {
      case 'estudiante':
        newUser = new Estudiante({
          ...baseUserData,
          nivel,
          estadoAcademico: estadoAcademico || 'inscrito'
        });
        break;
        
      case 'profesor':
        newUser = new Profesor({
          ...baseUserData,
          especialidades,
          tarifaPorHora,
          disponibilidad
        });
        break;
        
      case 'admin':
        newUser = new Admin({
          ...baseUserData,
          permisos: permisos || ['todos']
        });
        break;
        
      default:
        return res.status(400).json({
          success: false,
          message: 'Rol inválido',
          code: 'INVALID_ROLE'
        });
    }

    // Guardar el usuario
    await newUser.save();

    // Generar token
    const token = generateToken(newUser._id);

    res.status(201).json({
      success: true,
      message: 'Usuario registrado exitosamente',
      data: {
        token,
        user: newUser.toJSON()
      }
    });

  } catch (error) {
    console.error('Error en register:', error);
    
    // Manejar errores específicos de MongoDB
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      return res.status(400).json({
        success: false,
        message: `Ya existe un usuario con este ${field}`,
        code: 'DUPLICATE_KEY'
      });
    }

    // Manejar errores de validación de Mongoose
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(err => ({
        field: err.path,
        message: err.message
      }));
      
      return res.status(400).json({
        success: false,
        message: 'Errores de validación',
        errors: validationErrors
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      code: 'INTERNAL_ERROR'
    });
  }
};

// @desc    Login de usuario
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res) => {
  try {
    const validationError = handleValidationErrors(req, res);
    if (validationError) return validationError;

    const { email, password } = req.body;

    // Buscar usuario
    const user = await findUserByEmail(email);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Credenciales inválidas',
        code: 'INVALID_CREDENTIALS'
      });
    }

    // Verificar si el usuario está activo
    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Cuenta desactivada',
        code: 'ACCOUNT_DISABLED'
      });
    }

    // Verificar password
    const isPasswordCorrect = await user.comparePassword(password);
    if (!isPasswordCorrect) {
      return res.status(401).json({
        success: false,
        message: 'Credenciales inválidas',
        code: 'INVALID_CREDENTIALS'
      });
    }

    // Actualizar último login
    user.lastLogin = new Date();
    await user.save();

    // Generar token
    const token = generateToken(user._id);

    // Verificar si debe cambiar contraseña
    if (user.mustChangePassword) {
      return res.json({
        success: true,
        message: 'Debe cambiar su contraseña',
        mustChangePassword: true,
        data: {
          token,
          user: user.toJSON()
        }
      });
    }

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

// @desc    Obtener perfil del usuario
// @route   GET /api/auth/profile
// @access  Private
const getProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await findUserById(userId);

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
    const validationError = handleValidationErrors(req, res);
    if (validationError) return validationError;

    const userId = req.user.id;
    const { firstName, lastName, phone } = req.body;

    const user = await findUserById(userId);
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
    if (phone !== undefined) user.phone = phone;

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
    const validationError = handleValidationErrors(req, res);
    if (validationError) return validationError;

    const userId = req.user.id;
    const { currentPassword, newPassword } = req.body;

    const user = await findUserById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado',
        code: 'USER_NOT_FOUND'
      });
    }

    // Verificar contraseña actual
    const isCurrentPasswordCorrect = await user.comparePassword(currentPassword);
    if (!isCurrentPasswordCorrect) {
      return res.status(400).json({
        success: false,
        message: 'Contraseña actual incorrecta',
        code: 'INCORRECT_PASSWORD'
      });
    }

    // Actualizar contraseña
    user.password = newPassword;
    user.mustChangePassword = false;
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

// @desc    Cambiar contraseña forzado (primera vez)
// @route   PUT /api/auth/change-password-forced
// @access  Private
const changePasswordForced = async (req, res) => {
  try {
    const validationError = handleValidationErrors(req, res);
    if (validationError) return validationError;

    const userId = req.user.id;
    const { newPassword } = req.body;

    const user = await findUserById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado',
        code: 'USER_NOT_FOUND'
      });
    }

    // Verificar que realmente necesita cambiar contraseña
    if (!user.mustChangePassword) {
      return res.status(400).json({
        success: false,
        message: 'No necesita cambiar la contraseña',
        code: 'PASSWORD_CHANGE_NOT_REQUIRED'
      });
    }

    // Actualizar contraseña
    user.password = newPassword;
    user.mustChangePassword = false;
    await user.save();

    res.json({
      success: true,
      message: 'Contraseña actualizada exitosamente'
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

// @desc    Logout
// @route   POST /api/auth/logout
// @access  Private
const logout = async (req, res) => {
  try {
    // En una implementación real, aquí invalidarías el token
    // Por ejemplo, agregándolo a una blacklist
    
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

// @desc    Obtener estudiantes
// @route   GET /api/auth/students
// @access  Private
const getStudents = async (req, res) => {
  try {
    const { nivel, estadoAcademico, page = 1, limit = 10 } = req.query;

    // Construir filtros
    const filters = { role: 'estudiante' };
    if (nivel) filters.nivel = nivel;
    if (estadoAcademico) filters.estadoAcademico = estadoAcademico;

    // Paginación
    const skip = (page - 1) * limit;

    // Buscar estudiantes
    const students = await Estudiante.find(filters)
      .select('-password')
      .limit(limit * 1)
      .skip(skip)
      .sort({ createdAt: -1 });

    // Contar total
    const total = await Estudiante.countDocuments(filters);

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

// @desc    Obtener profesores
// @route   GET /api/auth/professors
// @access  Private (Admin only)
const getProfessors = async (req, res) => {
  try {
    const { especialidad, page = 1, limit = 10 } = req.query;

    // Construir filtros
    const filters = { role: 'profesor' };
    if (especialidad) {
      filters.especialidades = { $in: [especialidad] };
    }

    // Paginación
    const skip = (page - 1) * limit;

    // Buscar profesores
    const professors = await Profesor.find(filters)
      .select('-password')
      .limit(limit * 1)
      .skip(skip)
      .sort({ createdAt: -1 });

    // Contar total
    const total = await Profesor.countDocuments(filters);

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

// @desc    Actualizar información académica (Solo estudiantes)
// @route   PUT /api/auth/update-academic-info
// @access  Private (Student)
const updateAcademicInfo = async (req, res) => {
  try {
    const validationError = handleValidationErrors(req, res);
    if (validationError) return validationError;

    const userId = req.user.id;
    const { nivel, estadoAcademico } = req.body;

    // Buscar estudiante
    const student = await Estudiante.findById(userId);
    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Estudiante no encontrado',
        code: 'STUDENT_NOT_FOUND'
      });
    }

    // Verificar que el usuario es estudiante
    if (student.role !== 'estudiante') {
      return res.status(403).json({
        success: false,
        message: 'Solo los estudiantes pueden actualizar información académica',
        code: 'UNAUTHORIZED_ROLE'
      });
    }

    // Actualizar campos
    if (nivel) student.nivel = nivel;
    if (estadoAcademico) student.estadoAcademico = estadoAcademico;

    await student.save();

    res.json({
      success: true,
      message: 'Información académica actualizada exitosamente',
      data: {
        user: student.toJSON()
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

// @desc    Actualizar información de enseñanza (Solo profesores)
// @route   PUT /api/auth/update-teaching-info
// @access  Private (Professor)
const updateTeachingInfo = async (req, res) => {
  try {
    const validationError = handleValidationErrors(req, res);
    if (validationError) return validationError;

    const userId = req.user.id;
    const { especialidades, tarifaPorHora, disponibilidad } = req.body;

    // Buscar profesor
    const professor = await Profesor.findById(userId);
    if (!professor) {
      return res.status(404).json({
        success: false,
        message: 'Profesor no encontrado',
        code: 'PROFESSOR_NOT_FOUND'
      });
    }

    // Verificar que el usuario es profesor
    if (professor.role !== 'profesor') {
      return res.status(403).json({
        success: false,
        message: 'Solo los profesores pueden actualizar información de enseñanza',
        code: 'UNAUTHORIZED_ROLE'
      });
    }

    // Actualizar campos
    if (especialidades) professor.especialidades = especialidades;
    if (tarifaPorHora !== undefined) professor.tarifaPorHora = tarifaPorHora;
    if (disponibilidad) professor.disponibilidad = disponibilidad;

    await professor.save();

    res.json({
      success: true,
      message: 'Información de enseñanza actualizada exitosamente',
      data: {
        user: professor.toJSON()
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