// models/EventoCalendario.js
const mongoose = require('mongoose');

const eventoCalendarioSchema = new mongoose.Schema({
  usuario: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'BaseUser',
    required: [true, 'El usuario es obligatorio']
  },
  
  tipo: {
    type: String,
    enum: {
      values: ['clase', 'evaluacion', 'entrega', 'reunion', 'personal'],
      message: '{VALUE} no es un tipo válido'
    },
    required: [true, 'El tipo de evento es obligatorio']
  },
  
  referencia: {
    type: mongoose.Schema.Types.ObjectId,
    refPath: 'tipoReferencia'
  },
  
  tipoReferencia: {
    type: String,
    enum: ['Clase', 'Curso', 'Evaluacion']
  },
  
  titulo: {
    type: String,
    required: [true, 'El título del evento es obligatorio'],
    trim: true,
    minlength: [3, 'El título debe tener al menos 3 caracteres'],
    maxlength: [150, 'El título no puede exceder 150 caracteres']
  },
  
  descripcion: {
    type: String,
    trim: true,
    maxlength: [500, 'La descripción no puede exceder 500 caracteres']
  },
  
  fechaHora: {
    type: Date,
    required: [true, 'La fecha y hora del evento son obligatorias']
  },
  
  duracion: {
    type: Number,
    required: [true, 'La duración del evento es obligatoria (en minutos)'],
    min: [15, 'La duración mínima es 15 minutos'],
    max: [480, 'La duración máxima es 480 minutos (8 horas)']
  },
  
  recordatorio: {
    activo: {
      type: Boolean,
      default: true
    },
    minutosAntes: {
      type: Number,
      default: 30,
      min: [5, 'El recordatorio mínimo es 5 minutos antes'],
      max: [10080, 'El recordatorio máximo es 7 días antes']
    },
    enviado: {
      type: Boolean,
      default: false
    }
  },
  
  estado: {
    type: String,
    enum: {
      values: ['pendiente', 'completado', 'cancelado'],
      message: '{VALUE} no es un estado válido'
    },
    default: 'pendiente'
  },
  
  // Campos para eventos recurrentes (opcional, para futuro)
  esRecurrente: {
    type: Boolean,
    default: false
  },
  
  recurrencia: {
    frecuencia: {
      type: String,
      enum: ['diaria', 'semanal', 'quincenal', 'mensual']
    },
    diasSemana: [{
      type: Number,
      min: 0,
      max: 6 // 0 = Domingo, 6 = Sábado
    }],
    fechaFin: Date
  },
  
  // Metadata
  color: {
    type: String,
    default: '#3B82F6',
    match: [/^#[0-9A-F]{6}$/i, 'El color debe ser un código hexadecimal válido']
  },
  
  ubicacion: {
    type: String,
    trim: true,
    maxlength: [200, 'La ubicación no puede exceder 200 caracteres']
  },
  
  enlace: {
    type: String,
    trim: true,
    validate: {
      validator: function(value) {
        if (!value) return true;
        return /^https?:\/\/.+/.test(value);
      },
      message: 'El enlace debe ser una URL válida'
    }
  },
  
  notas: {
    type: String,
    trim: true,
    maxlength: [1000, 'Las notas no pueden exceder 1000 caracteres']
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Índices para optimizar búsquedas
eventoCalendarioSchema.index({ usuario: 1, fechaHora: 1 });
eventoCalendarioSchema.index({ usuario: 1, tipo: 1, estado: 1 });
eventoCalendarioSchema.index({ fechaHora: 1, estado: 1 });
eventoCalendarioSchema.index({ 'recordatorio.activo': 1, 'recordatorio.enviado': 1 });

// Virtual para calcular la hora de fin del evento
eventoCalendarioSchema.virtual('fechaHoraFin').get(function() {
  if (this.fechaHora && this.duracion) {
    return new Date(this.fechaHora.getTime() + this.duracion * 60000);
  }
  return null;
});

// Virtual para calcular minutos hasta el evento
eventoCalendarioSchema.virtual('minutosHastaEvento').get(function() {
  const ahora = new Date();
  return Math.floor((this.fechaHora - ahora) / 60000);
});

// Virtual para verificar si el evento ya pasó
eventoCalendarioSchema.virtual('yaPaso').get(function() {
  return this.fechaHoraFin && this.fechaHoraFin < new Date();
});

// Virtual para verificar si es hoy
eventoCalendarioSchema.virtual('esHoy').get(function() {
  const hoy = new Date();
  const fechaEvento = new Date(this.fechaHora);
  return fechaEvento.toDateString() === hoy.toDateString();
});

// Virtual para verificar si necesita recordatorio
eventoCalendarioSchema.virtual('necesitaRecordatorio').get(function() {
  if (!this.recordatorio.activo || this.recordatorio.enviado) {
    return false;
  }
  
  const ahora = new Date();
  const momentoRecordatorio = new Date(
    this.fechaHora.getTime() - this.recordatorio.minutosAntes * 60000
  );
  
  return ahora >= momentoRecordatorio && ahora < this.fechaHora;
});

// Middleware pre-save: validar que el usuario existe
eventoCalendarioSchema.pre('save', async function(next) {
  if (this.isModified('usuario')) {
    const BaseUser = mongoose.model('User');
    const usuario = await BaseUser.findById(this.usuario);
    
    if (!usuario) {
      return next(new Error('El usuario no existe'));
    }
  }
  next();
});

// Middleware pre-save: establecer color según tipo
eventoCalendarioSchema.pre('save', function(next) {
  if (this.isNew && !this.color) {
    const coloresPorTipo = {
      clase: '#3B82F6',      // Azul
      evaluacion: '#EF4444', // Rojo
      entrega: '#F59E0B',    // Amarillo/Naranja
      reunion: '#8B5CF6',    // Púrpura
      personal: '#10B981'    // Verde
    };
    
    this.color = coloresPorTipo[this.tipo] || '#6B7280'; // Gris por defecto
  }
  next();
});

// Método para marcar como completado
eventoCalendarioSchema.methods.completar = function() {
  if (this.estado !== 'completado') {
    this.estado = 'completado';
    return this.save();
  }
  throw new Error('El evento ya está completado');
};

// Método para cancelar
eventoCalendarioSchema.methods.cancelar = function() {
  if (this.estado !== 'cancelado') {
    this.estado = 'cancelado';
    return this.save();
  }
  throw new Error('El evento ya está cancelado');
};

// Método para marcar recordatorio como enviado
eventoCalendarioSchema.methods.marcarRecordatorioEnviado = function() {
  this.recordatorio.enviado = true;
  return this.save();
};

// Método estático para obtener eventos de un usuario en un rango de fechas
eventoCalendarioSchema.statics.findByUsuarioEnRango = function(usuarioId, fechaInicio, fechaFin, filtros = {}) {
  return this.find({
    usuario: usuarioId,
    fechaHora: {
      $gte: fechaInicio,
      $lte: fechaFin
    },
    ...filtros
  })
    .populate('referencia')
    .sort({ fechaHora: 1 });
};

// Método estático para obtener eventos del día
eventoCalendarioSchema.statics.findEventosDelDia = function(usuarioId, fecha = new Date()) {
  const inicioDia = new Date(fecha);
  inicioDia.setHours(0, 0, 0, 0);
  
  const finDia = new Date(fecha);
  finDia.setHours(23, 59, 59, 999);
  
  return this.find({
    usuario: usuarioId,
    fechaHora: {
      $gte: inicioDia,
      $lte: finDia
    },
    estado: { $ne: 'cancelado' }
  })
    .populate('referencia')
    .sort({ fechaHora: 1 });
};

// Método estático para obtener próximos eventos
eventoCalendarioSchema.statics.findProximos = function(usuarioId, limite = 5) {
  const ahora = new Date();
  return this.find({
    usuario: usuarioId,
    fechaHora: { $gte: ahora },
    estado: 'pendiente'
  })
    .populate('referencia')
    .sort({ fechaHora: 1 })
    .limit(limite);
};

// Método estático para obtener eventos que necesitan recordatorio
eventoCalendarioSchema.statics.findParaRecordatorio = function() {
  const ahora = new Date();
  
  return this.find({
    'recordatorio.activo': true,
    'recordatorio.enviado': false,
    estado: 'pendiente',
    fechaHora: { $gt: ahora }
  }).then(eventos => {
    return eventos.filter(evento => evento.necesitaRecordatorio);
  });
};

// Método estático para crear evento desde una clase
eventoCalendarioSchema.statics.crearDesdeClase = async function(clase, usuarioId) {
  const evento = new this({
    usuario: usuarioId,
    tipo: 'clase',
    referencia: clase._id,
    tipoReferencia: 'Clase',
    titulo: clase.titulo,
    descripcion: clase.descripcion,
    fechaHora: clase.fechaHora,
    duracion: clase.duracionMinutos,
    ubicacion: clase.modalidad === 'presencial' ? clase.aula : 'Virtual',
    enlace: clase.enlaceVirtual
  });
  
  return evento.save();
};

// Método estático para sincronizar eventos de clases de un usuario
eventoCalendarioSchema.statics.sincronizarClasesUsuario = async function(usuarioId) {
  const Clase = mongoose.model('Clase');
  
  // Buscar clases futuras del usuario (como profesor o estudiante)
  const ahora = new Date();
  const clases = await Clase.find({
    $or: [
      { profesor: usuarioId },
      { estudiantes: usuarioId }
    ],
    fechaHora: { $gte: ahora },
    estado: { $in: ['programada', 'en_curso'] }
  });
  
  // Crear eventos para clases que no tienen evento asociado
  const eventosCreados = [];
  for (const clase of clases) {
    const eventoExistente = await this.findOne({
      usuario: usuarioId,
      tipo: 'clase',
      referencia: clase._id
    });
    
    if (!eventoExistente) {
      const nuevoEvento = await this.crearDesdeClase(clase, usuarioId);
      eventosCreados.push(nuevoEvento);
    }
  }
  
  return eventosCreados;
};

// Método estático para obtener estadísticas de eventos
eventoCalendarioSchema.statics.getEstadisticas = async function(usuarioId, periodo = 'mes') {
  const ahora = new Date();
  let fechaInicio;
  
  switch(periodo) {
    case 'semana':
      fechaInicio = new Date(ahora.getTime() - 7 * 24 * 60 * 60 * 1000);
      break;
    case 'mes':
      fechaInicio = new Date(ahora.getFullYear(), ahora.getMonth(), 1);
      break;
    case 'año':
      fechaInicio = new Date(ahora.getFullYear(), 0, 1);
      break;
    default:
      fechaInicio = new Date(ahora.getFullYear(), ahora.getMonth(), 1);
  }
  
  const eventos = await this.find({
    usuario: usuarioId,
    fechaHora: { $gte: fechaInicio }
  });
  
  return {
    total: eventos.length,
    completados: eventos.filter(e => e.estado === 'completado').length,
    pendientes: eventos.filter(e => e.estado === 'pendiente').length,
    cancelados: eventos.filter(e => e.estado === 'cancelado').length,
    porTipo: {
      clase: eventos.filter(e => e.tipo === 'clase').length,
      evaluacion: eventos.filter(e => e.tipo === 'evaluacion').length,
      entrega: eventos.filter(e => e.tipo === 'entrega').length,
      reunion: eventos.filter(e => e.tipo === 'reunion').length,
      personal: eventos.filter(e => e.tipo === 'personal').length
    }
  };
};

const EventoCalendario = mongoose.model('EventoCalendario', eventoCalendarioSchema);

module.exports = EventoCalendario;