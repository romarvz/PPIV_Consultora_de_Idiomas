const mongoose = require('mongoose');
const { TIPOS_HORARIO } = require('../shared/utils/constants');

// Schema for Horario documents
const horarioSchema = new mongoose.Schema({
  dia: {
    type: String,
    required: [true, 'Día es requerido'],
    enum: {
      values: ['lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado', 'domingo'],
      message: 'Día debe ser uno de: lunes, martes, miercoles, jueves, viernes, sabado, domingo'
    },
    lowercase: true,
    trim: true
  },
  horaInicio: {
    type: String,
    required: [true, 'Hora de inicio es requerida'],
    match: [/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Hora de inicio debe tener formato HH:mm (ej: 09:30)'],
    trim: true
  },
  horaFin: {
    type: String,
    required: [true, 'Hora de fin es requerida'],
    match: [/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Hora de fin debe tener formato HH:mm (ej: 11:30)'],
    trim: true
  },
  descripcion: {
    type: String,
    trim: true
  },
  tipo: {
    type: String,
    enum: {
      values: Object.values(TIPOS_HORARIO),
      message: `Tipo debe ser uno de: ${Object.values(TIPOS_HORARIO).join(', ')}`
    },
    default: TIPOS_HORARIO.CLASE,
    required: [true, 'Tipo de horario es requerido']
  }
}, {
  timestamps: false, // Sin timestamps según requisitos
  collection: 'horarios'
});

// Índice único compuesto para evitar duplicados
horarioSchema.index({ dia: 1, horaInicio: 1, horaFin: 1 }, { unique: true });

// Índices adicionales para optimización de consultas
horarioSchema.index({ dia: 1 });
horarioSchema.index({ horaInicio: 1 });

// Virtual field para display con día capitalizado
horarioSchema.virtual('display').get(function() {
  if (!this.dia || !this.horaInicio || !this.horaFin) {
    return '';
  }
  
  // Capitalizar primera letra del día
  const diaCapitalizado = this.dia.charAt(0).toUpperCase() + this.dia.slice(1);
  return `${diaCapitalizado} ${this.horaInicio} - ${this.horaFin}`;
});

// Función auxiliar para convertir hora string a minutos
function horaAMinutos(hora) {
  const [horas, minutos] = hora.split(':').map(Number);
  return horas * 60 + minutos;
}

// Middleware pre-save para validaciones y autogeneración
horarioSchema.pre('save', async function(next) {
  try {
    // Autogenerar descripción
    if (this.dia && this.horaInicio && this.horaFin) {
      const diaCapitalizado = this.dia.charAt(0).toUpperCase() + this.dia.slice(1);
      this.descripcion = `${diaCapitalizado} ${this.horaInicio} - ${this.horaFin}`;
    }

    // Validar que horaFin sea posterior a horaInicio
    if (this.horaInicio && this.horaFin) {
      const inicioMinutos = horaAMinutos(this.horaInicio);
      const finMinutos = horaAMinutos(this.horaFin);
      
      if (finMinutos <= inicioMinutos) {
        return next(new Error('La hora de fin debe ser posterior a la hora de inicio'));
      }
    }

    // Validar solapamiento de horarios en el mismo día (solo si es un documento nuevo o se modificaron las horas)
    if (this.isNew || this.isModified('dia') || this.isModified('horaInicio') || this.isModified('horaFin')) {
      await this.validarSolapamiento();
    }

    next();
  } catch (error) {
    next(error);
  }
});

// Método para validar solapamiento de horarios
horarioSchema.methods.validarSolapamiento = async function() {
  const inicioMinutos = horaAMinutos(this.horaInicio);
  const finMinutos = horaAMinutos(this.horaFin);

  // Buscar horarios existentes en el mismo día (excluyendo el documento actual)
  const horariosExistentes = await this.constructor.find({
    dia: this.dia,
    _id: { $ne: this._id } // Excluir el documento actual
  });

  // Verificar solapamiento con cada horario existente
  for (const horarioExistente of horariosExistentes) {
    const existenteInicio = horaAMinutos(horarioExistente.horaInicio);
    const existenteFin = horaAMinutos(horarioExistente.horaFin);

    // Verificar si hay solapamiento
    const haySolapamiento = (inicioMinutos < existenteFin) && (finMinutos > existenteInicio);
    
    if (haySolapamiento) {
      throw new Error(
        `El horario se solapa con un horario existente: ${horarioExistente.descripcion}`
      );
    }
  }
};

// Static method para obtener horarios por día
horarioSchema.statics.getPorDia = function(dia) {
  return this.find({ dia: dia.toLowerCase() }).sort({ horaInicio: 1 });
};

// Static method para obtener horarios en un rango de tiempo
horarioSchema.statics.getPorRangoHorario = function(horaInicio, horaFin) {
  const inicioMinutos = horaAMinutos(horaInicio);
  const finMinutos = horaAMinutos(horaFin);
  
  return this.find().then(horarios => {
    return horarios.filter(horario => {
      const horarioInicio = horaAMinutos(horario.horaInicio);
      const horarioFin = horaAMinutos(horario.horaFin);
      
      // Verificar si el horario está dentro del rango
      return horarioInicio >= inicioMinutos && horarioFin <= finMinutos;
    });
  });
};

// Static method para verificar disponibilidad
horarioSchema.statics.verificarDisponibilidad = async function(dia, horaInicio, horaFin) {
  const inicioMinutos = horaAMinutos(horaInicio);
  const finMinutos = horaAMinutos(horaFin);

  const horariosExistentes = await this.find({ dia: dia.toLowerCase() });

  for (const horario of horariosExistentes) {
    const existenteInicio = horaAMinutos(horario.horaInicio);
    const existenteFin = horaAMinutos(horario.horaFin);

    if ((inicioMinutos < existenteFin) && (finMinutos > existenteInicio)) {
      return {
        disponible: false,
        conflicto: horario.descripcion
      };
    }
  }

  return { disponible: true };
};

// Method para obtener duración en minutos
horarioSchema.methods.getDuracionMinutos = function() {
  if (!this.horaInicio || !this.horaFin) return 0;
  
  const inicioMinutos = horaAMinutos(this.horaInicio);
  const finMinutos = horaAMinutos(this.horaFin);
  
  return finMinutos - inicioMinutos;
};

// Method para obtener duración formateada
horarioSchema.methods.getDuracionFormateada = function() {
  const minutos = this.getDuracionMinutos();
  const horas = Math.floor(minutos / 60);
  const minutosRestantes = minutos % 60;
  
  if (horas === 0) {
    return `${minutosRestantes} minutos`;
  } else if (minutosRestantes === 0) {
    return `${horas} ${horas === 1 ? 'hora' : 'horas'}`;
  } else {
    return `${horas}:${minutosRestantes.toString().padStart(2, '0')} horas`;
  }
};

// Método toJSON para API responses
horarioSchema.methods.toJSON = function() {
  const horario = this.toObject({ virtuals: true });
  
  return {
    _id: horario._id,
    dia: horario.dia,
    horaInicio: horario.horaInicio,
    horaFin: horario.horaFin,
    descripcion: horario.descripcion,
    display: horario.display,
    duracionMinutos: this.getDuracionMinutos(),
    duracionFormateada: this.getDuracionFormateada()
  };
};

// Middleware pre-validate para transformaciones adicionales
horarioSchema.pre('validate', function(next) {
  // Asegurar formato consistente de horas (agregar 0 inicial si es necesario)
  if (this.horaInicio) {
    const [hora, minuto] = this.horaInicio.split(':');
    this.horaInicio = `${hora.padStart(2, '0')}:${minuto.padStart(2, '0')}`;
  }
  
  if (this.horaFin) {
    const [hora, minuto] = this.horaFin.split(':');
    this.horaFin = `${hora.padStart(2, '0')}:${minuto.padStart(2, '0')}`;
  }
  
  next();
});

const Horario = mongoose.model('Horario', horarioSchema);

module.exports = Horario;