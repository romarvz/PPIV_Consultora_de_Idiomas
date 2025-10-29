const jwt = require('jsonwebtoken');
const { findUserById } = require('../models');

// Middleware para verificar token JWT
const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.header('Authorization');
    const token = authHeader && authHeader.startsWith('Bearer ') 
      ? authHeader.slice(7) 
      : null;

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Token de acceso requerido',
        code: 'NO_TOKEN'
      });
    }

    // Verificar token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'mi_clave_secreta');
    
    // Verificar que el usuario existe y está activo
    const user = await findUserById(decoded.id);
    if (!user || !user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Token inválido o usuario inactivo',
        code: 'INVALID_TOKEN'
      });
    }

    // Agregar usuario a la request
    req.user = {
      id: user._id,
      userId: user._id, // Mantener compatibilidad
      email: user.email,
      role: user.role,
      firstName: user.firstName,
      lastName: user.lastName,
      fullUser: user // En caso de que necesitemos acceso completo
    };

    next();

  } catch (error) {
    console.error('Error en authenticateToken:', error);
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token expirado',
        code: 'TOKEN_EXPIRED'
      });
    }
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Token inválido',
        code: 'INVALID_TOKEN'
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      code: 'INTERNAL_ERROR'
    });
  }
};

// Middleware para verificar rol de administrador
const requireAdmin = (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Usuario no autenticado',
        code: 'NOT_AUTHENTICATED'
      });
    }

    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Acceso denegado. Se requieren permisos de administrador',
        code: 'INSUFFICIENT_PERMISSIONS'
      });
    }

    next();

  } catch (error) {
    console.error('Error en requireAdmin:', error);
    return res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      code: 'INTERNAL_ERROR'
    });
  }
};

// Middleware para verificar rol de profesor
const requireProfesor = (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Usuario no autenticado',
        code: 'NOT_AUTHENTICATED'
      });
    }

    if (req.user.role !== 'profesor') {
      return res.status(403).json({
        success: false,
        message: 'Acceso denegado. Se requieren permisos de profesor',
        code: 'INSUFFICIENT_PERMISSIONS'
      });
    }

    next();

  } catch (error) {
    console.error('Error en requireProfesor:', error);
    return res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      code: 'INTERNAL_ERROR'
    });
  }
};

// Middleware para verificar rol de estudiante
const requireEstudiante = (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Usuario no autenticado',
        code: 'NOT_AUTHENTICATED'
      });
    }

    if (req.user.role !== 'estudiante') {
      return res.status(403).json({
        success: false,
        message: 'Acceso denegado. Se requieren permisos de estudiante',
        code: 'INSUFFICIENT_PERMISSIONS'
      });
    }

    next();

  } catch (error) {
    console.error('Error en requireEstudiante:', error);
    return res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      code: 'INTERNAL_ERROR'
    });
  }
};

// Middleware para verificar múltiples roles
const requireRole = (roles) => {
  return (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'Usuario no autenticado',
          code: 'NOT_AUTHENTICATED'
        });
      }

      if (!roles.includes(req.user.role)) {
        return res.status(403).json({
          success: false,
          message: `Acceso denegado. Se requiere uno de los siguientes roles: ${roles.join(', ')}`,
          code: 'INSUFFICIENT_PERMISSIONS'
        });
      }

      next();

    } catch (error) {
      console.error('Error en requireRole:', error);
      return res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        code: 'INTERNAL_ERROR'
      });
    }
  };
};

// Middleware para verificar que el usuario sea propietario del recurso o admin
const requireOwnerOrAdmin = (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Usuario no autenticado',
        code: 'NOT_AUTHENTICATED'
      });
    }

    const resourceUserId = req.params.userId || req.body.userId;
    const isOwner = req.user.id.toString() === resourceUserId;
    const isAdmin = req.user.role === 'admin';

    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Acceso denegado. Solo el propietario o un administrador pueden acceder',
        code: 'INSUFFICIENT_PERMISSIONS'
      });
    }

    next();

  } catch (error) {
    console.error('Error en requireOwnerOrAdmin:', error);
    return res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      code: 'INTERNAL_ERROR'
    });
  }
};

module.exports = {
  authenticateToken,
  requireAdmin,
  requireProfesor,
  requireEstudiante,
  requireRole,
  requireOwnerOrAdmin
};