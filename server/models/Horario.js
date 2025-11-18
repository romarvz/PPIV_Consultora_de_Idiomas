// models/Horario.js
const mongoose = require('mongoose');

/**
 * Define un bloque de horario estándar.
 * Ej: Lunes, 09:00 a 11:00
 */
const horarioSchema = new mongoose.Schema({
  dia: {
    type: String,
    required: true,
    enum: ['lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado', 'domingo'],
  },
  horaInicio: {
    type: String, // Formato "HH:mm" ej: "09:00"
    required: true,
    match: [/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Formato de hora inválido. Usar HH:mm']
  },
  horaFin: {
    type: String, // Formato "HH:mm" ej: "11:00"
    required: true,
    match: [/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Formato de hora inválido. Usar HH:mm']
  },
  // Un campo "amigable" para mostrar en el frontend
  descripcion: {
    type: String,
    trim: true
  }
}, {
  timestamps: false,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual para mostrar "Lunes 09:00-11:00"
horarioSchema.virtual('display').get(function() {
  // Capitalizar día
  const diaCapitalizado = this.dia.charAt(0).toUpperCase() + this.dia.slice(1);
  return `${diaCapitalizado} ${this.horaInicio} - ${this.horaFin}`;
});

// Middleware para auto-generar la descripción
horarioSchema.pre('save', function(next) {
  if (this.isModified('dia') || this.isModified('horaInicio') || this.isModified('horaFin')) {
    const diaCapitalizado = this.dia.charAt(0).toUpperCase() + this.dia.slice(1);
    this.descripcion = `${diaCapitalizado} ${this.horaInicio} - ${this.horaFin}`;
  }
  next();
});

// Índice para asegurar horarios únicos
horarioSchema.index({ dia: 1, horaInicio: 1, horaFin: 1 }, { unique: true });

const Horario = mongoose.model('Horario', horarioSchema);

module.exports = Horario;