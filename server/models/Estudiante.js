const mongoose = require('mongoose');
const BaseUser = require('./BaseUser');

// Specific Schema for Students
const estudianteSchema = new mongoose.Schema({
  nivel: {
    type: String,
    enum: ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'],
    required: [true, 'Nivel es requerido para estudiantes']
  },
  estadoAcademico: {
    type: String,
    enum: ['inscrito', 'en_curso', 'graduado', 'suspendido'],
    default: 'inscrito'
  }
});

// Create the Estudiante model using discriminator
const Estudiante = BaseUser.discriminator('estudiante', estudianteSchema);

module.exports = Estudiante;