// models/index.js
// Archivo de índice para importar todos los modelos

// Modelos existentes (Daniela)
const BaseUser = require('./BaseUser');
const Estudiante = require('./Estudiante');
const Profesor = require('./Profesor');
const Admin = require('./Admin');
const Language = require('./Language');

// Modelos nuevos (Alexa - Cursos y Clases)
const Curso = require('./Curso');
const Inscripcion = require('./Inscripcion');
const Clase = require('./clase');
const EventoCalendario = require('./EventoCalendario');

// Otros modelos futuros (Roma Ayelen, Vero)
// const Empresa = require('./Empresa'); // Roma
// const AuditoriaLog = require('./AuditoriaLog'); // Roma
// const Pago = require('./Pago'); // Ayelen
// const Factura = require('./Factura'); // Ayelen
// const ConceptoPago = require('./ConceptoPago'); // Ayelen
// const PerfilEstudiante = require('./PerfilEstudiante'); // Vero
// const ReporteAcademico = require('./ReporteAcademico'); // Vero
// const ReporteFinanciero = require('./ReporteFinanciero'); // Vero
const Empresa = require('./Empresa');
const AuditoriaLog = require('./AuditoriaLog');

module.exports = {
  // Modelos base
  BaseUser,
  Estudiante,
  Profesor,
  Admin,
  Language,
  
  // Modelos de Cursos y Clases (Alexa)
  Curso,
  Inscripcion,
  Clase,
  EventoCalendario,
  
  // Futuros modelos (ir descomentando cuando se suban)
  // Empresa,
  // AuditoriaLog,
  // Pago,
  // Factura,
  // ConceptoPago,
  // PerfilEstudiante,
  // ReporteAcademico,
  // ReporteFinanciero
  
  // ============================================
  // HELPERS(mantener)
  // ============================================
  
  Empresa,
  AuditoriaLog,
  //function helper
  getUserModel: (role) => {
    switch(role) {
      case 'estudiante':
      case 'student':
        return Estudiante;
      case 'profesor':
      case 'teacher':
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