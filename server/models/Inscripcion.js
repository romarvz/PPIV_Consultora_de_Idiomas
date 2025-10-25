// models/Inscripcion.js
const mongoose = require('mongoose');

const inscripcionSchema = new mongoose.Schema({
  estudiante: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'BaseUser',
    required: [true, 'El estudiante es obligatorio']
  },
  
  curso: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Curso',
    required: [true, 'El curso es obligatorio']
  },
  
  fechaInscripcion: {
    type: Date,
    default: Date.now,
    required: true
  },
  
  estado: {
    type: String,
    enum: {
      values: ['pendiente', 'confirmada', 'cancelada'],
      message: '{VALUE} no es un estado válido'
    },
    default: 'pendiente'
  },
  
  progreso: {
    horasCompletadas: {
      type: Number,
      default: 0,
      min: [0, 'Las horas completadas no pueden ser negativas']
    },
    porcentaje: {
      type: Number,
      default: 0,
      min: [0, 'El porcentaje no puede ser negativo'],
      max: [100, 'El porcentaje no puede exceder 100']
    }
  },
  
  // Campos adicionales útiles
  notasAdicionales: {
    type: String,
    trim: true,
    maxlength: [500, 'Las notas no pueden exceder 500 caracteres']
  },
  
  fechaCancelacion: {
    type: Date
  },
  
  motivoCancelacion: {
    type: String,
    trim: true,
    maxlength: [300, 'El motivo no puede exceder 300 caracteres']
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Índices para optimizar búsquedas
inscripcionSchema.index({ estudiante: 1, curso: 1 }, { unique: true }); // Un estudiante solo puede inscribirse una vez al mismo curso
inscripcionSchema.index({ curso: 1, estado: 1 });
inscripcionSchema.index({ estudiante: 1, estado: 1 });
inscripcionSchema.index({ fechaInscripcion: -1 });

// Virtual para verificar si la inscripción está activa
inscripcionSchema.virtual('estaActiva').get(function() {
  return this.estado === 'confirmada';
});

// Virtual para verificar si está completa
inscripcionSchema.virtual('estaCompleta').get(function() {
  return this.progreso.porcentaje >= 100;
});

// Middleware pre-save: validar que estudiante y curso existen
inscripcionSchema.pre('save', async function(next) {
  // Validar estudiante
  if (this.isNew || this.isModified('estudiante')) {
    const BaseUser = mongoose.model('BaseUser');
    const estudiante = await BaseUser.findById(this.estudiante);
    
    if (!estudiante) {
      return next(new Error('El estudiante no existe'));
    }
    
    if (estudiante.role !== 'student') {
      return next(new Error('El usuario no es un estudiante'));
    }
  }
  
  // Validar curso
  if (this.isNew || this.isModified('curso')) {
    const Curso = mongoose.model('Curso');
    const curso = await Curso.findById(this.curso);
    
    if (!curso) {
      return next(new Error('El curso no existe'));
    }
    
    if (curso.estado === 'cancelado') {
      return next(new Error('No se puede inscribir a un curso cancelado'));
    }
    
    if (curso.estado === 'completado') {
      return next(new Error('No se puede inscribir a un curso completado'));
    }
  }
  
  next();
});

// Middleware post-save: agregar estudiante al array del curso
inscripcionSchema.post('save', async function(doc) {
  if (doc.estado === 'confirmada') {
    const Curso = mongoose.model('Curso');
    const curso = await Curso.findById(doc.curso);
    
    if (curso && !curso.estaInscrito(doc.estudiante)) {
      curso.agregarEstudiante(doc.estudiante);
      await curso.save();
    }
  }
});

// Middleware post-save: remover estudiante del array del curso si se cancela
inscripcionSchema.post('save', async function(doc) {
  if (doc.estado === 'cancelada' && doc.isModified('estado')) {
    const Curso = mongoose.model('Curso');
    const curso = await Curso.findById(doc.curso);
    
    if (curso && curso.estaInscrito(doc.estudiante)) {
      curso.removerEstudiante(doc.estudiante);
      await curso.save();
    }
  }
});

// Método para actualizar progreso
inscripcionSchema.methods.actualizarProgreso = async function(horasNuevas) {
  const Curso = mongoose.model('Curso');
  const curso = await Curso.findById(this.curso);
  
  if (!curso) {
    throw new Error('Curso no encontrado');
  }
  
  this.progreso.horasCompletadas += horasNuevas;
  
  // Calcular porcentaje (no puede exceder 100)
  this.progreso.porcentaje = Math.min(
    (this.progreso.horasCompletadas / curso.duracionTotal) * 100,
    100
  );
  
  return this.save();
};

// Método para confirmar inscripción
inscripcionSchema.methods.confirmar = function() {
  if (this.estado === 'pendiente') {
    this.estado = 'confirmada';
    return this.save();
  }
  throw new Error('Solo se pueden confirmar inscripciones pendientes');
};

// Método para cancelar inscripción
inscripcionSchema.methods.cancelar = function(motivo) {
  if (this.estado !== 'cancelada') {
    this.estado = 'cancelada';
    this.fechaCancelacion = new Date();
    this.motivoCancelacion = motivo;
    return this.save();
  }
  throw new Error('La inscripción ya está cancelada');
};

// Método estático para buscar inscripciones por estudiante
inscripcionSchema.statics.findByEstudiante = function(estudianteId, filtros = {}) {
  return this.find({ estudiante: estudianteId, ...filtros })
    .populate('curso', 'nombre idioma nivel fechaInicio fechaFin estado')
    .populate('estudiante', 'firstName lastName email')
    .sort({ fechaInscripcion: -1 });
};

// Método estático para buscar inscripciones por curso
inscripcionSchema.statics.findByCurso = function(cursoId, filtros = {}) {
  return this.find({ curso: cursoId, ...filtros })
    .populate('estudiante', 'firstName lastName email phone')
    .sort({ fechaInscripcion: -1 });
};

// Método estático para buscar inscripciones activas de un estudiante
inscripcionSchema.statics.findActivasByEstudiante = function(estudianteId) {
  return this.find({ 
    estudiante: estudianteId, 
    estado: 'confirmada' 
  })
    .populate('curso', 'nombre idioma nivel fechaInicio fechaFin profesor')
    .populate({
      path: 'curso',
      populate: {
        path: 'profesor',
        select: 'firstName lastName email'
      }
    })
    .sort({ fechaInscripcion: -1 });
};

// Método estático para verificar si un estudiante ya está inscrito
inscripcionSchema.statics.verificarInscripcion = async function(estudianteId, cursoId) {
  const inscripcion = await this.findOne({
    estudiante: estudianteId,
    curso: cursoId,
    estado: { $in: ['pendiente', 'confirmada'] }
  });
  return !!inscripcion;
};

// Método estático para obtener estadísticas de un curso
inscripcionSchema.statics.getEstadisticasCurso = async function(cursoId) {
  const inscripciones = await this.find({ curso: cursoId });
  
  return {
    total: inscripciones.length,
    confirmadas: inscripciones.filter(i => i.estado === 'confirmada').length,
    pendientes: inscripciones.filter(i => i.estado === 'pendiente').length,
    canceladas: inscripciones.filter(i => i.estado === 'cancelada').length,
    progresoPromedio: inscripciones.length > 0 
      ? inscripciones.reduce((sum, i) => sum + i.progreso.porcentaje, 0) / inscripciones.length 
      : 0
  };
};

const Inscripcion = mongoose.model('Inscripcion', inscripcionSchema);

module.exports = Inscripcion;