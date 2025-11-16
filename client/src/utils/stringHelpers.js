/**
 * Capitaliza la primera letra de un string y pone el resto en minúscula
 * @param {string} str - String a capitalizar
 * @returns {string} String capitalizado
 */
export function capitalizeName(str) {
  if (!str || typeof str !== 'string') {
    return str;
  }
  
  const trimmed = str.trim();
  if (trimmed.length === 0) {
    return trimmed;
  }
  
  // Si todo está en mayúsculas, convertir a minúsculas primero
  const normalized = trimmed === trimmed.toUpperCase() 
    ? trimmed.toLowerCase() 
    : trimmed;
  
  // Capitalizar primera letra, resto en minúscula
  return normalized.charAt(0).toUpperCase() + normalized.slice(1).toLowerCase();
}

/**
 * Capitaliza nombres y apellidos de un objeto de usuario
 * @param {Object} userData - Objeto con firstName y/o lastName
 * @returns {Object} Objeto con nombres capitalizados
 */
export function capitalizeUserNames(userData) {
  const result = { ...userData };
  
  if (result.firstName) {
    result.firstName = capitalizeName(result.firstName);
  }
  
  if (result.lastName) {
    result.lastName = capitalizeName(result.lastName);
  }
  
  return result;
}

