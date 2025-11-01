// models/Curso.js
const mongoose = require('mongoose');

const cursoSchema = new mongoose.Schema({
  nombre: {
    type: String,
    required: [true, 'El nombre del curso es obligatorio'],
    trim: true,
    minlength: [3, 'El nombre debe tener al menos 3 caracteres'],
    maxlength: [100, 'El nombre no puede exceder 100 caracteres']
  },
  
  idioma: {
    type: String,
    required: [true, 'El idioma es obligatorio'],
    enum: {
      values: ['ingles', 'frances', 'aleman', 'italiano', 'portugues', 'chino', 'japones', 'coreano'],
      message: '{VALUE} no es un idioma válido'
    }
  },
  
  nivel: {
    type: String,
    required: [true, 'El nivel es obligatorio'],
    enum: {
      values: ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'],
      message: '{VALUE} no es un nivel válido según MCER'
    }
  },
  
  descripcion: {
    type: String,
    trim: true,
    maxlength: [1000, 'La descripción no puede exceder 1000 caracteres']
  },
  
  duracionTotal: {
    type: Number,
    required: [true, 'La duración total en horas es obligatoria'],
    min: [10, 'La duración mínima es 10 horas'],
    max: [500, 'La duración máxima es 500 horas']
  },
  
  tarifa: {
    type: Number,
    required: [true, 'La tarifa por hora es obligatoria'],
    min: [0, 'La tarifa no puede ser negativa']
  },
  
  profesor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'BaseUser',
    required: [true, 'El curso debe tener un profesor asignado']
  },
  
  horario: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Horario',
    required: [true, 'El horario del curso es obligatorio']
  },
  
  estudiantes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'BaseUser'
  }],
  
  fechaInicio: {
    type: Date,
    required: [true, 'La fecha de inicio es obligatoria']
  },
  
  fechaFin: {
    type: Date,
    required: [true, 'La fecha de fin es obligatoria'],
    validate: {
      validator: function(value) {
        return value > this.fechaInicio;
      },
      message: 'La fecha de fin debe ser posterior a la fecha de inicio'
    }
  },
  
  estado: {
    type: String,
    enum: {
      values: ['planificado', 'activo', 'completado', 'cancelado'],
      message: '{VALUE} no es un estado válido'
    },
    default: 'planificado'
  },
  
  requisitos: {
    type: String,
    trim: true,
    maxlength: [500, 'Los requisitos no pueden exceder 500 caracteres']
  },
  
  objetivos: {
    type: String,
    trim: true,
    maxlength: [1000, 'Los objetivos no pueden exceder 1000 caracteres']
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Índices para optimizar búsquedas
cursoSchema.index({ profesor: 1, estado: 1 });
cursoSchema.index({ idioma: 1, nivel: 1 });
cursoSchema.index({ fechaInicio: 1, fechaFin: 1 });

// Virtual para calcular el número de estudiantes inscritos
cursoSchema.virtual('numeroEstudiantes').get(function() {
  return this.estudiantes ? this.estudiantes.length : 0;
});

// Virtual para calcular el costo total del curso
cursoSchema.virtual('costoTotal').get(function() {
  return this.duracionTotal * this.tarifa;
});

// Virtual para verificar si el curso está activo
cursoSchema.virtual('estaActivo').get(function() {
  const hoy = new Date();
  return this.estado === 'activo' && 
         this.fechaInicio <= hoy && 
         this.fechaFin >= hoy;
});

// Middleware pre-save: validar que el profesor existe y tiene el rol correcto
cursoSchema.pre('save', async function(next) {
  if (this.isModified('profesor')) {
    const BaseUser = mongoose.model('User');
    const profesor = await BaseUser.findById(this.profesor);
    
    if (!profesor) {
      return next(new Error('El profesor no existe'));
    }
    
    if (profesor.role !== 'profesor') {
      return next(new Error('El usuario asignado no es un profesor'));
    }
  }
  next();
});

// Middleware pre-save: validar que los estudiantes existen
cursoSchema.pre('save', async function(next) {
  if (this.isModified('estudiantes') && this.estudiantes.length > 0) {
    const BaseUser = mongoose.model('User');
    const estudiantes = await BaseUser.find({
      _id: { $in: this.estudiantes },
      role: 'estudiante'
    });
    
    if (estudiantes.length !== this.estudiantes.length) {
      return next(new Error('Uno o más estudiantes no son válidos'));
    }
  }
  next();
});

// Método para verificar si un estudiante está inscrito
cursoSchema.methods.estaInscrito = function(estudianteId) {
  return this.estudiantes.some(id => id.toString() === estudianteId.toString());
};

// Método para agregar un estudiante
cursoSchema.methods.agregarEstudiante = function(estudianteId) {
  if (!this.estaInscrito(estudianteId)) {
    this.estudiantes.push(estudianteId);
    return true;
  }
  return false;
};

// Método para remover un estudiante
cursoSchema.methods.removerEstudiante = function(estudianteId) {
  const index = this.estudiantes.findIndex(id => id.toString() === estudianteId.toString());
  if (index > -1) {
    this.estudiantes.splice(index, 1);
    return true;
  }
  return false;
};

// Método estático para buscar cursos por profesor
cursoSchema.statics.findByProfesor = function(profesorId, filtros = {}) {
  return this.find({ profesor: profesorId, ...filtros })
    .populate('profesor', 'firstName lastName email')
    .populate('estudiantes', 'firstName lastName email')
    .sort({ fechaInicio: -1 });
};

// Método estático para buscar cursos activos
cursoSchema.statics.findActivos = function() {
  const hoy = new Date();
  return this.find({
    estado: 'activo',
    fechaInicio: { $lte: hoy },
    fechaFin: { $gte: hoy }
  }).populate('profesor', 'firstName lastName');
};

const Curso = mongoose.model('Curso', cursoSchema);

module.exports = Curso;