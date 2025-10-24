/**
 * Company Model
 * Configuration and details of the company
 * 
 */

const mongoose = require('mongoose')

const empresaSchema = new mongoose.Schema({
  nombre: {
    type: String,
    required: [true, 'El nombre de la empresa es requerido'],
    trim: true
  },
  
  ruc: {
    type: String,
    unique: true,
    sparse: true
  },
  
  direccion: {
    calle: String,
    ciudad: String,
    provincia: String,
    codigoPostal: String,
    pais: { type: String, default: 'Argentina' }
  },
  
  contacto: {
    telefono: String,
    email: {
      type: String,
      required: [true, 'El email de la empresa es requerido']
    },
    sitioWeb: String
  },
  
  logo: {
    type: String, // URL or path to logo image
    default: null
  },
  
  configuracion: {
    horasMinimas: {
      type: Number,
      default: 1,
      min: [1, 'Las horas mínimas deben ser al menos 1']
    },
    horasMaximas: {
      type: Number,
      default: 4,
      max: [8, 'Las horas máximas no pueden exceder 8']
    },
    diasAnticipacionCancelacion: {
      type: Number,
      default: 1,
      min: [0, 'Los días de anticipación no pueden ser negativos']
    },
    porcentajePenalizacion: {
      type: Number,
      default: 50,
      min: [0, 'El porcentaje no puede ser negativo'],
      max: [100, 'El porcentaje no puede exceder 100']
    }
  },
  
  estadisticas: {
    totalEstudiantes: { type: Number, default: 0 },
    totalProfesores: { type: Number, default: 0 },
    totalCursos: { type: Number, default: 0 },
    totalClases: { type: Number, default: 0 },
    ingresosTotal: { type: Number, default: 0 }
  },
  
  activa: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
})

// Only one active company at a time
empresaSchema.index({ activa: 1 }, { unique: true, partialFilterExpression: { activa: true } })

const Empresa = mongoose.model('Empresa', empresaSchema)

module.exports = Empresa