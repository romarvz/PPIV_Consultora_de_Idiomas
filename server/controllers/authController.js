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

    const { email, password, firstName, lastName, role, phone } = req.body;

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
      password,
      firstName,
      lastName,
      role: role || 'estudiante',
      phone
    };

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
    const User = require('../models/User');
    const user = await User.findById(userId).select('+password');
    
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

module.exports = {
  register,
  login,
  getProfile,
  updateProfile,
  changePassword,
  logout
};
