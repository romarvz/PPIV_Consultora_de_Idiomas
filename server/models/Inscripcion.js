// models/Inscripcion.js
const mongoose = require('mongoose');

// Helper function para obtener modelos de forma segura
// Maneja especialmente el caso de discriminadores como Estudiante
function getModel(modelName) {
  // Primero intentar obtener desde mongoose.models (modelos ya cargados)
  if (mongoose.models[modelName]) {
    return mongoose.models[modelName];
  }
  
  try {
    return mongoose.model(modelName);
  } catch (error) {
    // Si el modelo no está registrado, intentar cargarlo
    if (error.name === 'MissingSchemaError' || error.message.includes('hasn\'t been registered')) {
      // Para Estudiante, usar BaseUser con filtro ya que es un discriminador
      if (modelName === 'Estudiante') {
        // Estudiante es un discriminador, usar BaseUser directamente
        // pero necesitamos asegurarnos de que BaseUser esté cargado
        if (!mongoose.models.BaseUser) {
          require('./BaseUser');
        }
        // Cargar Estudiante para registrar el discriminador
        if (!mongoose.models.Estudiante) {
          require('./Estudiante');
        }
        return mongoose.models.Estudiante || mongoose.model('Estudiante');
      }
      
      // Para otros modelos, intentar cargarlos
      try {
        if (modelName === 'Curso') {
          require('./Curso');
        } else if (modelName === 'Clase') {
          require('./Clase');
        } else if (modelName === 'BaseUser') {
          require('./BaseUser');
        }
        return mongoose.model(modelName);
      } catch (directImportError) {
        throw new Error(`Modelo ${modelName} no encontrado. Error: ${directImportError.message}`);
      }
    }
    throw error;
  }
}

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

  // Notas académicas (planilla)
  tp1: {
    type: Number,
    min: [0, 'La nota no puede ser negativa'],
    max: [10, 'La nota no puede ser mayor que 10']
  },
  tp2: {
    type: Number,
    min: [0, 'La nota no puede ser negativa'],
    max: [10, 'La nota no puede ser mayor que 10']
  },
  parcial1: {
    type: Number,
    min: [0, 'La nota no puede ser negativa'],
    max: [10, 'La nota no puede ser mayor que 10']
  },
  parcial2: {
    type: Number,
    min: [0, 'La nota no puede ser negativa'],
    max: [10, 'La nota no puede ser mayor que 10']
  },
  examenFinal: {
    type: Number,
    min: [0, 'La nota no puede ser negativa'],
    max: [10, 'La nota no puede ser mayor que 10']
  },
  promedioFinal: {
    type: Number,
    min: [0, 'El promedio no puede ser negativo'],
    max: [10, 'El promedio no puede ser mayor que 10']
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
// Índice único parcial: solo aplica a inscripciones activas (no canceladas)
// Esto permite que un estudiante pueda inscribirse nuevamente después de cancelar
inscripcionSchema.index(
  { estudiante: 1, curso: 1 }, 
  { 
    unique: true,
    partialFilterExpression: { estado: { $in: ['pendiente', 'confirmada'] } }
  }
);
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

// Función helper para comparar niveles académicos
// Retorna true si el nivel del estudiante es igual o superior al nivel requerido del curso
function validarNivelEstudiante(nivelEstudiante, nivelCurso) {
  const niveles = {
    'A1': 1,
    'A2': 2,
    'B1': 3,
    'B2': 4,
    'C1': 5,
    'C2': 6
  };
  
  const nivelEstudianteNum = niveles[nivelEstudiante];
  const nivelCursoNum = niveles[nivelCurso];
  
  // Si alguno de los niveles no es válido, retornar false
  if (!nivelEstudianteNum || !nivelCursoNum) {
    return false;
  }
  
  // El estudiante puede inscribirse si su nivel es igual o superior al del curso
  return nivelEstudianteNum >= nivelCursoNum;
}

// Middleware pre-save: validar que estudiante y curso existen
inscripcionSchema.pre('save', async function(next) {
  // Validar estudiante
  if (this.isNew || this.isModified('estudiante')) {
    const BaseUserModel = mongoose.models.BaseUser || mongoose.model('BaseUser');
    // Buscar el estudiante usando BaseUser con filtro por role
    const estudiante = await BaseUserModel.findOne({ 
      _id: this.estudiante, 
      role: 'estudiante' 
    });
    
    if (!estudiante) {
      return next(new Error('El estudiante no existe o no es un estudiante'));
    }
    
    // Validar estado académico del estudiante
    if (estudiante.estadoAcademico === 'suspendido') {
      return next(new Error('El estudiante está suspendido y no puede inscribirse a cursos. Debe cambiar su estado académico a activo primero.'));
    }
    
    // Validar nivel del estudiante con el nivel del curso
    if (this.isNew || this.isModified('curso')) {
      const CursoModel = mongoose.models.Curso || mongoose.model('Curso');
      const curso = await CursoModel.findById(this.curso);
      
      if (curso) {
        // Verificar que el estudiante tenga el nivel requerido
        if (!validarNivelEstudiante(estudiante.nivel, curso.nivel)) {
          return next(new Error(
            `El estudiante tiene nivel ${estudiante.nivel} y no puede inscribirse a un curso de nivel ${curso.nivel}. ` +
            `Se requiere nivel ${curso.nivel} o superior.`
          ));
        }
      }
    }
  }
  
  // Validar curso
  if (this.isNew || this.isModified('curso')) {
    const CursoModel = mongoose.models.Curso || mongoose.model('Curso');
    const curso = await CursoModel.findById(this.curso);
    
    if (!curso) {
      return next(new Error('El curso no existe'));
    }
    
    if (curso.estado === 'cancelado') {
      return next(new Error('No se puede inscribir a un curso cancelado'));
    }
    
    if (curso.estado === 'completado') {
      return next(new Error('No se puede inscribir a un curso completado'));
    }
    
    // Validar nivel del estudiante con el nivel del curso (si no se validó antes)
    if (!this.isModified('estudiante') && this.estudiante) {
      const BaseUserModel = mongoose.models.BaseUser || mongoose.model('BaseUser');
      const estudiante = await BaseUserModel.findOne({ 
        _id: this.estudiante, 
        role: 'estudiante' 
      });
      
      if (estudiante) {
        // Validar estado académico
        if (estudiante.estadoAcademico === 'suspendido') {
          return next(new Error('El estudiante está suspendido y no puede inscribirse a cursos. Debe cambiar su estado académico a activo primero.'));
        }
        
        // Validar nivel
        if (estudiante.nivel && !validarNivelEstudiante(estudiante.nivel, curso.nivel)) {
          return next(new Error(
            `El estudiante tiene nivel ${estudiante.nivel} y no puede inscribirse a un curso de nivel ${curso.nivel}. ` +
            `Se requiere nivel ${curso.nivel} o superior.`
          ));
        }
      }
    }
  }
  
  next();
});

// Middleware post-save: agregar estudiante al array del curso y a las clases existentes
inscripcionSchema.post('save', async function(doc) {
  if (doc.estado === 'confirmada') {
    const Curso = mongoose.models.Curso || mongoose.model('Curso');
    const Clase = mongoose.models.Clase || mongoose.model('Clase');
    const curso = await Curso.findById(doc.curso);
    
    if (curso && !curso.estaInscrito(doc.estudiante)) {
      curso.agregarEstudiante(doc.estudiante);
      await curso.save();
      
      // Agregar estudiante a todas las clases existentes del curso que aún no estén completadas
      await Clase.updateMany(
        { 
          curso: doc.curso,
          estado: { $ne: 'completada' },
          estudiantes: { $ne: doc.estudiante }
        },
        { 
          $addToSet: { estudiantes: doc.estudiante }
        }
      );
    }
  }
});

// Middleware post-save: remover estudiante del array del curso si se cancela
inscripcionSchema.post('save', async function(doc) {
  if (doc.estado === 'cancelada' && doc.isModified('estado')) {
    const Curso = mongoose.models.Curso || mongoose.model('Curso');
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
    .populate('estudiante', 'firstName lastName email dni')
    .sort({ fechaInscripcion: -1 });
};

// Método estático para buscar inscripciones por curso
inscripcionSchema.statics.findByCurso = function(cursoId, filtros = {}) {
  return this.find({ curso: cursoId, ...filtros })
    .populate('estudiante', 'firstName lastName email phone dni')
    .sort({ fechaInscripcion: -1 });
};

// Método estático para buscar inscripciones activas de un estudiante
inscripcionSchema.statics.findActivasByEstudiante = function(estudianteId) {
  console.log('findActivasByEstudiante - buscando inscripciones para estudiante:', estudianteId);
  return this.find({ 
    estudiante: estudianteId, 
    estado: 'confirmada' 
  })
    .populate({
      path: 'curso',
      select: 'nombre idioma nivel fechaInicio fechaFin estado profesor horario horarios modalidad',
      populate: [
        {
          path: 'profesor',
          select: 'firstName lastName email'
        },
        {
          path: 'horario',
          select: 'dia horaInicio horaFin descripcion',
          options: { strictPopulate: false }
        },
        {
          path: 'horarios',
          select: 'dia horaInicio horaFin descripcion',
          options: { strictPopulate: false }
        }
      ]
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