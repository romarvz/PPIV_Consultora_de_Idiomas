/**
 * Audit Model
 * Registers significant events in the system for security and compliance purposes.
 * 
 */

const mongoose = require('mongoose')
const { TIPOS_EVENTO_AUDITORIA } = require('../shared/utils/constants')

const auditoriaLogSchema = new mongoose.Schema({
  tipo: {
    type: String,
    enum: Object.values(TIPOS_EVENTO_AUDITORIA),
    required: [true, 'El tipo de evento es requerido']
  },
  
  usuario: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'BaseUser',
    required: [true, 'El usuario es requerido']
  },
  
  descripcion: {
    type: String,
    required: [true, 'La descripción es requerida']
  },
  
  detalle: {
    type: mongoose.Schema.Types.Mixed, // Puede ser cualquier objeto
    default: {}
  },
  
  ip: {
    type: String
  },
  
  userAgent: {
    type: String
  }
}, {
  timestamps: true // Agrega createdAt y updatedAt automáticamente
})

// Índices para consultas rápidas
auditoriaLogSchema.index({ tipo: 1, createdAt: -1 })
auditoriaLogSchema.index({ usuario: 1, createdAt: -1 })
auditoriaLogSchema.index({ createdAt: -1 })

const AuditoriaLog = mongoose.model('AuditoriaLog', auditoriaLogSchema)

module.exports = AuditoriaLog