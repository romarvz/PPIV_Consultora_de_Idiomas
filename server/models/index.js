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
const Clase = require('./Clase');
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
  
  // Función helper para obtener el modelo correcto según el rol
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
  
  // Función para buscar cualquier usuario sin importar el tipo
  findUserByEmail: async (email) => {
    return await BaseUser.findOne({ email });
  },
  
  // Función para buscar usuario por ID sin importar el tipo
  findUserById: async (id) => {
    return await BaseUser.findById(id);
  }
};