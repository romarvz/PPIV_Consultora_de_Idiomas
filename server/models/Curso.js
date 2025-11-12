// server/models/Curso.js

const mongoose = require('mongoose');

const CursoSchema = new mongoose.Schema({
  // Campos del formulario
  nombre: { type: String, required: true },
  idioma: { 
    type: String, 
    enum: ['ingles', 'frances', 'aleman', 'italiano', 'portugues', 'chino', 'japones', 'coreano'], 
    required: true 
  },
  nivel: { 
    type: String, 
    enum: ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'], 
    required: true 
  },
  descripcion: { type: String, default: '' },
  duracionTotal: { type: Number, required: true, min: 1 },
  tarifa: { type: Number, required: true, min: 0 },
  profesor: { type: mongoose.Schema.Types.ObjectId, ref: 'BaseUser', required: true },
  horario: { type: mongoose.Schema.Types.ObjectId, ref: 'Horario' }, // Horario principal (para compatibilidad)
  horarios: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Horario' }], // Múltiples horarios (2-3 días por semana)
  horariosDuraciones: [{
    horario: { type: mongoose.Schema.Types.ObjectId, ref: 'Horario' },
    duracionMinutos: { type: Number, min: 30, max: 180, default: 120 }
  }],
  duracionClaseMinutos: {
    type: Number,
    min: 30,
    max: 180,
    default: 120
  },
  fechaInicio: { type: Date },
  fechaFin: { type: Date },
  modalidad: {
    type: String,
    enum: ['presencial', 'online'],
    default: 'presencial'
  },
  estado: { 
    type: String, 
    enum: ["planificado", "activo", "completado", "cancelado"], 
    default: 'planificado' 
  },
  requisitos: { type: String, default: '' },
  objetivos: { type: String, default: '' },
  
  // --- CAMPOS PARA FRONTEND ---
  
  type: {
    type: String,
    enum: ['Curso Grupal', 'Clase Individual', 'Curso Corporativo', 'Certificacion', 'Inmersion Cultural', 'Otros'],
    default: 'Curso Grupal'
  },

  //Image
  imageUrl: {
    type: String,
    default: '/assets/images/default-course.png' // Una imagen por defecto
  },

  vacantesMaximas: {
    type: Number,
    min: 1,
    max: 1000,
    default: 30
  },


  // Campo de Inscripción
  estudiantes: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'BaseUser' 
  }],

}, { 
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual para calcular el costo total
CursoSchema.virtual('costoTotal').get(function() {
  if (this.duracionTotal && this.tarifa) {
    return this.duracionTotal * this.tarifa;
  }
  return null;
});

CursoSchema.methods.estaInscrito = function(estudianteId) {
  if (!estudianteId) {
    return false;
  }
  const idStr = estudianteId.toString();
  return (this.estudiantes || []).some((est) => {
    if (! est) {
      return false;
    }
    const candidate = est._id ? est._id.toString() : est.toString();
    return candidate === idStr;
  });
};

CursoSchema.methods.agregarEstudiante = function(estudianteId) {
  if (!estudianteId) {
    return;
  }
  if (!this.estudiantes) {
    this.estudiantes = [];
  }
  if (!this.estaInscrito(estudianteId)) {
    this.estudiantes.push(estudianteId);
  }
};

CursoSchema.methods.removerEstudiante = function(estudianteId) {
  if (!estudianteId || !Array.isArray(this.estudiantes)) {
    return;
  }
  const idStr = estudianteId.toString();
  this.estudiantes = this.estudiantes.filter((est) => {
    const candidate = est._id ? est._id.toString() : est.toString();
    return candidate !== idStr;
  });
};

module.exports = mongoose.model('Curso', CursoSchema);