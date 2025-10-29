// Archivo de índice para importar todos los modelos
const BaseUser = require('./BaseUser');
const Estudiante = require('./Estudiante');
const Profesor = require('./Profesor');
const Admin = require('./Admin');
const Language = require('./Language');

module.exports = {
  BaseUser,
  Estudiante,
  Profesor,
  Admin,
  Language,
  // Función helper para obtener el modelo correcto según el rol
  getUserModel: (role) => {
    switch(role) {
      case 'estudiante':
        return Estudiante;
      case 'profesor':
        return Profesor;
      case 'admin':
        return Admin;
      default:
        return BaseUser;
    }
  },
  // Función para buscar cualquier usuario sin importar el tipo
  findUserByEmail: async (email) => {
    return await BaseUser.findOne({ email });
  },
  // Función para buscar usuario por ID sin importar el tipo
  findUserById: async (id) => {
    return await BaseUser.findById(id);
  }
};