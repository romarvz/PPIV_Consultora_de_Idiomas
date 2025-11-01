// Archivo de índice para importar todos los modelos
const BaseUser = require('./BaseUser');
const Estudiante = require('./Estudiante');
const Profesor = require('./Profesor');
const Admin = require('./Admin');
const Language = require('./Language');
const Empresa = require('./Empresa');
const AuditoriaLog = require('./AuditoriaLog');
const Horario = require('./Horario');
const Curso = require('./Curso');

module.exports = {
  BaseUser,
  Estudiante,
  Profesor,
  Admin,
  Language,
  Empresa,
  AuditoriaLog,
  Horario,
  Curso,
  //function helper
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
  // Function to find any user regardless of type
  findUserByEmail: async (email) => {
    return await BaseUser.findOne({ email });
  },
  // Function to find user by ID regardless of type
  findUserById: async (id) => {
    return await BaseUser.findById(id);
  }
};