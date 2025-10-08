import bbdd from '../data/bbdd.json';

/**
 * Servicio de autenticación para el módulo financiero
 * Usa bbdd.json como fuente de datos
 */

/**
 * Iniciar sesión con email y contraseña
 * @param {string} email - Email del usuario
 * @param {string} password - Contraseña del usuario
 * @returns {Object} Usuario autenticado o null
 */
export function login(email, password) {
  const usuario = bbdd.usuarios.find(
    u => u.email === email && u.password === password && u.activo
  );

  if (!usuario) {
    throw new Error('Credenciales inválidas');
  }

  // Crear sesión (guardar en localStorage)
  const sesion = {
    id: usuario.id,
    email: usuario.email,
    nombre: usuario.nombre,
    rol: usuario.rol,
    permisos: usuario.permisos,
    timestamp: new Date().toISOString()
  };

  localStorage.setItem('financial_session', JSON.stringify(sesion));
  
  return sesion;
}

/**
 * Cerrar sesión
 */
export function logout() {
  localStorage.removeItem('financial_session');
}

/**
 * Obtener sesión actual
 * @returns {Object|null} Sesión actual o null
 */
export function getCurrentSession() {
  const sesionStr = localStorage.getItem('financial_session');
  if (!sesionStr) return null;

  try {
    return JSON.parse(sesionStr);
  } catch (error) {
    console.error('Error al parsear sesión:', error);
    return null;
  }
}

/**
 * Verificar si el usuario está autenticado
 * @returns {boolean}
 */
export function isAuthenticated() {
  return getCurrentSession() !== null;
}

/**
 * Verificar si el usuario tiene un permiso específico
 * @param {string} permiso - Permiso a verificar
 * @returns {boolean}
 */
export function hasPermission(permiso) {
  const sesion = getCurrentSession();
  if (!sesion) return false;

  return sesion.permisos.includes(permiso) || sesion.permisos.includes('todos');
}

/**
 * Verificar si el usuario tiene un rol específico
 * @param {string} rol - Rol a verificar
 * @returns {boolean}
 */
export function hasRole(rol) {
  const sesion = getCurrentSession();
  if (!sesion) return false;

  return sesion.rol === rol;
}
