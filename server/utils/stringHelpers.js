/**
 * Capitaliza la primera letra de cada palabra en un string
 * Maneja correctamente nombres y apellidos compuestos (ej: "San Martín", "María José")
 * @param {string} str - String a capitalizar
 * @returns {string} String capitalizado
 */
function capitalizeName(str) {
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
  
  // Dividir por espacios y capitalizar cada palabra
  return normalized
    .split(/\s+/) // Dividir por uno o más espacios
    .map(word => {
      if (word.length === 0) return word;
      // Capitalizar primera letra de cada palabra, resto en minúscula
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    })
    .join(' '); // Unir con un solo espacio
}

/**
 * Capitaliza nombres y apellidos de un objeto de usuario
 * @param {Object} userData - Objeto con firstName y/o lastName
 * @returns {Object} Objeto con nombres capitalizados
 */
function capitalizeUserNames(userData) {
  const result = { ...userData };
  
  if (result.firstName) {
    result.firstName = capitalizeName(result.firstName);
  }
  
  if (result.lastName) {
    result.lastName = capitalizeName(result.lastName);
  }
  
  return result;
}

module.exports = {
  capitalizeName,
  capitalizeUserNames
};

