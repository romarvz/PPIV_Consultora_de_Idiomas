const jwt = require('jsonwebtoken');
const userService = require('../services/userService');

/**
 * Valida si el usuario tiene permisos para crear cuentas con roles específicos
 * @param {string} role - Rol
 * @param {string} authHeader - Header de autorización
 * @returns {Object} { isValid: boolean, error?: string, code?: string }
 */
const validateRolePermissions = async (role, authHeader) => {
  // Solo admins pueden crear otros admins o profesores
  if (role === 'admin' || role === 'profesor') {
    if (!authHeader) {
      return {
        isValid: false,
        error: 'Solo administradores pueden crear cuentas de administrador o profesor',
        code: 'ADMIN_REQUIRED'
      };
    }

    try {
      const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
      if (!token) {
        return {
          isValid: false,
          error: 'Token de autorización requerido',
          code: 'TOKEN_REQUIRED'
        };
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const requester = await userService.getUserProfile(decoded.userId);
      
      if (!requester || requester.role !== 'admin') {
        return {
          isValid: false,
          error: 'Solo administradores pueden crear cuentas de administrador o profesor',
          code: 'ADMIN_REQUIRED'
        };
      }
    } catch (error) {
      return {
        isValid: false,
        error: 'Token inválido',
        code: 'INVALID_TOKEN'
      };
    }
  }

  return { isValid: true };
};

/**
 * Extrae y valida el token JWT del header de autorización
 * @param {string} authHeader - Header de autorización
 * @returns {Object} { token?: string, error?: string }
 */
const extractToken = (authHeader) => {
  if (!authHeader) {
    return { error: 'Header de autorización requerido' };
  }

  if (!authHeader.startsWith('Bearer ')) {
    return { error: 'Formato de token inválido. Use: Bearer <token>' };
  }

  const token = authHeader.slice(7);
  if (!token) {
    return { error: 'Token no proporcionado' };
  }

  return { token };
};

/**
 * Verifica si un usuario tiene permisos para realizar una acción específica
 * @param {Object} user - Usuario que intenta realizar la acción
 * @param {string} requiredRole - Rol requerido para la acción
 * @returns {boolean}
 */
const hasPermission = (user, requiredRole) => {
  if (!user || !user.role) return false;
  
  const roleHierarchy = {
    'estudiante': 1,
    'profesor': 2,
    'admin': 3
  };

  const userLevel = roleHierarchy[user.role] || 0;
  const requiredLevel = roleHierarchy[requiredRole] || 0;

  return userLevel >= requiredLevel;
};

module.exports = {
  validateRolePermissions,
  extractToken,
  hasPermission
};