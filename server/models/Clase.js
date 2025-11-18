// models/Clase.js
const mongoose = require('mongoose');

// Subdocumento de asistencia
const asistenciaSchema = new mongoose.Schema({
  estudiante: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'BaseUser',
    required: true
  },
  presente: {
    type: Boolean,
    default: false
  },
  minutosTarde: {
    type: Number,
    default: 0,
    min: [0, 'Los minutos de tardanza no pueden ser negativos']
  },
  comentarios: {
    type: String,
    trim: true,
    maxlength: [200, 'Los comentarios no pueden exceder 200 caracteres']
  },
  registradoPor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'BaseUser'
  },
  fechaRegistro: {
    type: Date,
    default: Date.now
  }
}, { _id: true });

const claseSchema = new mongoose.Schema({
  curso: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Curso',
    required: [true, 'La clase debe estar asociada a un curso']
  },
  
  titulo: {
    type: String,
    required: [true, 'El título de la clase es obligatorio'],
    trim: true,
    minlength: [3, 'El título debe tener al menos 3 caracteres'],
    maxlength: [150, 'El título no puede exceder 150 caracteres']
  },
  
  descripcion: {
    type: String,
    trim: true,
    maxlength: [1000, 'La descripción no puede exceder 1000 caracteres']
  },
  
  profesor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'BaseUser',
    required: [true, 'La clase debe tener un profesor asignado']
  },
  
  estudiantes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'BaseUser'
  }],
  
  fechaHora: {
    type: Date,
    required: [true, 'La fecha y hora de la clase son obligatorias']
  },
  
  duracionMinutos: {
    type: Number,
    required: [true, 'La duración de la clase es obligatoria'],
    min: [30, 'La duración mínima es 30 minutos'],
    max: [180, 'La duración máxima es 180 minutos']
  },
  
  estado: {
    type: String,
    enum: {
      values: ['programada', 'en_curso', 'completada', 'cancelada'],
      message: '{VALUE} no es un estado válido'
    },
    default: 'programada'
  },
  
  modalidad: {
    type: String,
    enum: {
      values: ['presencial', 'virtual'],
      message: '{VALUE} no es una modalidad válida'
    },
    required: [true, 'La modalidad es obligatoria']
  },
  
  aula: {
    type: String,
    trim: true,
    maxlength: [50, 'El nombre del aula no puede exceder 50 caracteres']
  },
  
  enlaceVirtual: {
    type: String,
    trim: true,
    validate: {
      validator: function(value) {
        // Solo validar si la modalidad es virtual y hay un valor
        if (this.modalidad === 'virtual' && value) {
          return /^https?:\/\/.+/.test(value);
        }
        return true;
      },
      message: 'El enlace virtual debe ser una URL válida'
    }
  },
  
  asistencia: [asistenciaSchema],
  
  contenido: {
    type: String,
    trim: true,
    maxlength: [2000, 'El contenido no puede exceder 2000 caracteres']
  },
  
  tareas: {
    type: String,
    trim: true,
    maxlength: [1000, 'Las tareas no pueden exceder 1000 caracteres']
  },
  
  // Campos adicionales
  materialDidactico: [{
    nombre: String,
    url: String,
    tipo: {
      type: String,
      enum: ['pdf', 'video', 'audio', 'documento', 'otro']
    }
  }],
  
  notasProfesor: {
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
claseSchema.index({ curso: 1, fechaHora: 1 });
claseSchema.index({ profesor: 1, fechaHora: 1 });
claseSchema.index({ estado: 1, fechaHora: 1 });
claseSchema.index({ fechaHora: 1 });

// Virtual para calcular la hora de fin de la clase
claseSchema.virtual('fechaHoraFin').get(function() {
  if (this.fechaHora && this.duracionMinutos) {
    return new Date(this.fechaHora.getTime() + this.duracionMinutos * 60000);
  }
  return null;
});

// Virtual para calcular duración en horas (para progreso de curso)
claseSchema.virtual('duracionHoras').get(function() {
  return this.duracionMinutos / 60;
});

// Virtual para calcular porcentaje de asistencia
claseSchema.virtual('porcentajeAsistencia').get(function() {
  if (this.asistencia.length === 0) return 0;
  const presentes = this.asistencia.filter(a => a.presente).length;
  return (presentes / this.asistencia.length) * 100;
});

// Virtual para contar estudiantes presentes
claseSchema.virtual('estudiantesPresentes').get(function() {
  return this.asistencia.filter(a => a.presente).length;
});

// Virtual para verificar si la clase ya pasó
claseSchema.virtual('yaPaso').get(function() {
  return this.fechaHoraFin && this.fechaHoraFin < new Date();
});

// Middleware pre-save: validar que el profesor existe y es profesor
claseSchema.pre('save', async function(next) {
  if (this.isModified('profesor')) {
    const BaseUser = mongoose.model('BaseUser');
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

// Middleware pre-save: validar que el curso existe
claseSchema.pre('save', async function(next) {
  if (this.isModified('curso')) {
    const Curso = mongoose.model('Curso');
    const curso = await Curso.findById(this.curso);
    
    if (!curso) {
      return next(new Error('El curso no existe'));
    }
    
    // Validar que el profesor de la clase sea el mismo del curso
    if (this.profesor && curso.profesor.toString() !== this.profesor.toString()) {
      return next(new Error('El profesor de la clase debe ser el mismo del curso'));
    }
  }
  next();
});

// Middleware pre-save: validar modalidad tiene los campos requeridos
claseSchema.pre('save', function(next) {
  if (this.modalidad === 'presencial' && !this.aula) {
    return next(new Error('Las clases presenciales requieren un aula asignada'));
  }
  
  if (this.modalidad === 'virtual' && !this.enlaceVirtual) {
    return next(new Error('Las clases virtuales requieren un enlace'));
  }
  
  next();
});

// Método para registrar asistencia de un estudiante
claseSchema.methods.registrarAsistencia = function(estudianteId, presente, minutosTarde = 0, comentarios = '', registradoPor = null) {
  // Verificar si ya existe registro de asistencia para este estudiante
  const index = this.asistencia.findIndex(
    a => a.estudiante.toString() === estudianteId.toString()
  );
  
  if (index > -1) {
    // Actualizar registro existente
    this.asistencia[index].presente = presente;
    this.asistencia[index].minutosTarde = minutosTarde;
    this.asistencia[index].comentarios = comentarios;
    this.asistencia[index].registradoPor = registradoPor;
    this.asistencia[index].fechaRegistro = new Date();
  } else {
    // Crear nuevo registro
    this.asistencia.push({
      estudiante: estudianteId,
      presente,
      minutosTarde,
      comentarios,
      registradoPor,
      fechaRegistro: new Date()
    });
  }
  
  return this.save();
};

// Método para marcar clase como completada y actualizar progreso de inscripciones
claseSchema.methods.completar = async function() {
  if (this.estado !== 'completada') {
    this.estado = 'completada';
    await this.save();
    
    // Actualizar progreso de cada estudiante presente
    const Inscripcion = mongoose.model('Inscripcion');
    const estudiantesPresentes = this.asistencia
      .filter(a => a.presente)
      .map(a => a.estudiante);
    
    for (const estudianteId of estudiantesPresentes) {
      const inscripcion = await Inscripcion.findOne({
        estudiante: estudianteId,
        curso: this.curso,
        estado: 'confirmada'
      });
      
      if (inscripcion) {
        await inscripcion.actualizarProgreso(this.duracionHoras);
      }
    }
  }
  
  return this;
};

// Método para cancelar clase
claseSchema.methods.cancelar = function(motivo) {
  if (this.estado !== 'cancelada') {
    this.estado = 'cancelada';
    this.fechaCancelacion = new Date();
    this.motivoCancelacion = motivo;
    return this.save();
  }
  throw new Error('La clase ya está cancelada');
};

// Método para verificar disponibilidad del profesor
claseSchema.statics.verificarDisponibilidadProfesor = async function(
  profesorId,
  fechaHora,
  duracionMinutos,
  claseIdExcluir = null,
  cursoId = null
) {
  const fechaInicio = new Date(fechaHora);
  const fechaFin = new Date(fechaInicio.getTime() + duracionMinutos * 60000);
  
  const query = {
    profesor: profesorId,
    estado: { $in: ['programada', 'en_curso'] },
    $or: [
      {
        fechaHora: { $lt: fechaFin },
        // Calculamos fechaHoraFin usando $expr
        $expr: {
          $gt: [
            { $add: ['$fechaHora', { $multiply: ['$duracionMinutos', 60000] }] },
            fechaInicio
          ]
        }
      }
    ]
  };
  
  if (claseIdExcluir) {
    const excludeId = mongoose.Types.ObjectId.isValid(claseIdExcluir)
      ? new mongoose.Types.ObjectId(claseIdExcluir)
      : claseIdExcluir;
    query._id = { $ne: excludeId };
  }
  
  let clasesSuperpuestas = await this.find(query);

  if (cursoId) {
    const cursoIdStr = cursoId.toString();
    const inicioMs = fechaInicio.getTime();
    clasesSuperpuestas = clasesSuperpuestas.filter((clase) => {
      if (!clase.fechaHora) {
        return true;
      }
      const mismaHora = clase.fechaHora.getTime() === inicioMs;
      const mismoCurso =
        clase.curso &&
        clase.curso.toString &&
        clase.curso.toString() === cursoIdStr;
      
      if (mismaHora && mismoCurso) {
        return false;
      }
      return true;
    });
  }

  return clasesSuperpuestas.length === 0;
};

// Método estático para buscar clases por profesor
claseSchema.statics.findByProfesor = function(profesorId, filtros = {}) {
  return this.find({ profesor: profesorId, ...filtros })
    .populate('curso', 'nombre idioma nivel')
    .populate('profesor', 'firstName lastName email')
    .sort({ fechaHora: -1 });
};

// Método estático para buscar clases por estudiante
// Incluye clases donde el estudiante está en el array `estudiantes`
// o al menos tiene un registro en `asistencia.estudiante`
claseSchema.statics.findByEstudiante = function(estudianteId, filtros = {}) {
  const baseQuery = {
    $or: [
      { estudiantes: estudianteId },
      { 'asistencia.estudiante': estudianteId }
    ]
  };

  // Orden ascendente por fechaHora: las clases más próximas primero
  return this.find({ ...baseQuery, ...filtros })
    .populate('curso', 'nombre idioma nivel')
    .populate('profesor', 'firstName lastName email')
    .sort({ fechaHora: 1 });
};

// Método estático para buscar clases por curso
claseSchema.statics.findByCurso = function(cursoId, filtros = {}) {
  return this.find({ curso: cursoId, ...filtros })
    .populate('profesor', 'firstName lastName email')
    .sort({ fechaHora: 1 });
};

// Método estático para obtener próximas clases
claseSchema.statics.findProximas = function(usuarioId, limite = 10) {
  const ahora = new Date();
  return this.find({
    $or: [
      { profesor: usuarioId },
      { estudiantes: usuarioId }
    ],
    fechaHora: { $gte: ahora },
    estado: { $in: ['programada', 'en_curso'] }
  })
    .populate('curso', 'nombre idioma nivel')
    .populate('profesor', 'firstName lastName')
    .sort({ fechaHora: 1 })
    .limit(limite);
};

// Método estático para obtener estadísticas de asistencia de un estudiante
claseSchema.statics.getEstadisticasAsistencia = async function(estudianteId, cursoId = null) {
  const query = {
    'asistencia.estudiante': estudianteId,
    estado: 'completada'
  };
  
  if (cursoId) {
    query.curso = cursoId;
  }
  
  const clases = await this.find(query);
  
  const totalClases = clases.length;
  const clasesAsistidas = clases.filter(clase => 
    clase.asistencia.some(a => 
      a.estudiante.toString() === estudianteId.toString() && a.presente
    )
  ).length;
  
  return {
    totalClases,
    clasesAsistidas,
    clasesFaltadas: totalClases - clasesAsistidas,
    porcentajeAsistencia: totalClases > 0 ? (clasesAsistidas / totalClases) * 100 : 0
  };
};

const Clase = mongoose.model('Clase', claseSchema);

module.exports = Clase;