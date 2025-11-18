// Archivo de índice para importar todos los modelos
const BaseUser = require('./BaseUser');
const Estudiante = require('./Estudiante');
const Profesor = require('./Profesor');
const Admin = require('./Admin');
const Language = require('./Language');
const Empresa = require('./Empresa');
const AuditoriaLog = require('./AuditoriaLog');

const Curso = require('./Curso');
const Horario = require('./Horario');
const Inscripcion = require('./Inscripcion');
const Clase = require('./Clase');
const EventoCalendario = require('./EventoCalendario');
const PerfilEstudiante = require('./PerfilEstudiante');
const ReporteAcademico = require('./ReporteAcademico');
const ReporteFinanciero = require('./ReporteFinanciero');

module.exports = {
  BaseUser,
  Estudiante,
  Profesor,
  Admin,
  Language,
  Empresa,
  AuditoriaLog,
  Curso,
  Horario,
  Inscripcion,
  Clase,
  EventoCalendario,
  PerfilEstudiante,
  ReporteAcademico,
  ReporteFinanciero,

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
  // Función para buscar cualquier usuario sin importar el tipo
  findUserByEmail: async (email) => {
    // Normalizar email: lowercase y trim
    const normalizedEmail = email ? email.toLowerCase().trim() : email;
    return await BaseUser.findOne({ email: normalizedEmail });
  },
  // Función para buscar usuario por ID sin importar el tipo
  findUserById: async (id) => {
    return await BaseUser.findById(id);
  }
};