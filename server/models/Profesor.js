const mongoose = require('mongoose');
const BaseUser = require('./BaseUser');

// Schema específico para profesores
const profesorSchema = new mongoose.Schema({
  especialidades: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Language',
    required: true
  }],
  tarifaPorHora: {
    type: Number,
    required: [true, 'Tarifa por hora es requerida para profesores'],
    min: [0, 'La tarifa no puede ser negativa']
  },
  disponibilidad: {
    lunes: [{ 
      inicio: { type: String, match: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/ },
      fin: { type: String, match: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/ }
    }],
    martes: [{ 
      inicio: { type: String, match: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/ },
      fin: { type: String, match: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/ }
    }],
    miercoles: [{ 
      inicio: { type: String, match: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/ },
      fin: { type: String, match: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/ }
    }],
    jueves: [{ 
      inicio: { type: String, match: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/ },
      fin: { type: String, match: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/ }
    }],
    viernes: [{ 
      inicio: { type: String, match: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/ },
      fin: { type: String, match: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/ }
    }],
    sabado: [{ 
      inicio: { type: String, match: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/ },
      fin: { type: String, match: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/ }
    }]
  }
});

// Validación personalizada para especialidades
profesorSchema.pre('validate', function(next) {
  if (this.especialidades && this.especialidades.length === 0) {
    this.invalidate('especialidades', 'Debe tener al menos una especialidad');
  }
  next();
});

// Método para obtener profesores con especialidades pobladas
profesorSchema.statics.findWithLanguages = function(filter = {}) {
  return this.find(filter).populate('especialidades', 'code name nativeName isActive');
};

// Método de instancia para obtener nombres de especialidades
profesorSchema.methods.getLanguageNames = function() {
  if (this.especialidades && this.especialidades.length > 0) {
    return this.especialidades.map(lang => lang.name || lang.toString()).join(', ');
  }
  return 'Sin especialidades';
};

// ==================== MÉTODOS PARA GESTIÓN DE HORARIOS ====================

/**
 * Asignar horario permitido al profesor
 * @param {String|ObjectId} horarioId - ID del horario
 * @returns {Promise<Boolean>} - true si se asignó correctamente
 */
profesorSchema.methods.asignarHorario = async function(horarioId) {
  try {
    // Verificar que el horario no esté ya asignado
    if (this.horariosPermitidos.includes(horarioId)) {
      throw new Error('El horario ya está asignado a este profesor');
    }

    // Verificar que el horario existe
    const Horario = require('./Horario');
    const horario = await Horario.findById(horarioId);
    if (!horario) {
      throw new Error('Horario no encontrado');
    }

    // Asignar horario
    this.horariosPermitidos.push(horarioId);
    await this.save();
    
    return true;
  } catch (error) {
    throw error;
  }
};

/**
 * Remover horario permitido del profesor
 * @param {String|ObjectId} horarioId - ID del horario
 * @returns {Promise<Boolean>} - true si se removió correctamente
 */
profesorSchema.methods.removerHorario = async function(horarioId) {
  try {
    // Verificar que el horario esté asignado (convertir a string para comparar)
    const horarioIdStr = horarioId.toString();
    const index = this.horariosPermitidos.findIndex(id => id.toString() === horarioIdStr);
    
    if (index === -1) {
      throw new Error('El horario no está asignado a este profesor');
    }

    // Remover horario
    this.horariosPermitidos.splice(index, 1);
    await this.save();
    
    return true;
  } catch (error) {
    throw error;
  }
};

/**
 * Obtener horarios permitidos con detalles completos
 * @returns {Promise<Array>} - Array de horarios con detalles
 */
profesorSchema.methods.obtenerHorariosDetallados = async function() {
  try {
    await this.populate('horariosPermitidos');
    return this.horariosPermitidos || [];
  } catch (error) {
    throw error;
  }
};

/**
 * Verificar si tiene un horario específico asignado
 * @param {String|ObjectId} horarioId - ID del horario
 * @returns {Boolean} - true si tiene el horario asignado
 */
profesorSchema.methods.tieneHorario = function(horarioId) {
  const horarioIdStr = horarioId.toString();
  return this.horariosPermitidos.some(id => id.toString() === horarioIdStr);
};

/**
 * Verificar conflictos con un nuevo horario
 * @param {Object} nuevoHorario - {dia, horaInicio, horaFin}
 * @returns {Promise<Array>} - Array de conflictos encontrados
 */
profesorSchema.methods.verificarConflictos = async function(nuevoHorario) {
  try {
    await this.populate('horariosPermitidos');
    
    const conflictos = [];
    const { dia, horaInicio, horaFin } = nuevoHorario;
    
    // Convertir horas a minutos para comparación
    const horaAMinutos = (hora) => {
      const [horas, minutos] = hora.split(':').map(Number);
      return horas * 60 + minutos;
    };
    
    const nuevoInicio = horaAMinutos(horaInicio);
    const nuevoFin = horaAMinutos(horaFin);

    // Verificar cada horario asignado
    for (const horario of this.horariosPermitidos) {
      if (horario.dia === dia) {
        const existenteInicio = horaAMinutos(horario.horaInicio);
        const existenteFin = horaAMinutos(horario.horaFin);
        
        // Verificar solapamiento
        if ((nuevoInicio < existenteFin) && (nuevoFin > existenteInicio)) {
          conflictos.push({
            horarioId: horario._id,
            descripcion: horario.descripcion,
            tipo: 'solapamiento'
          });
        }
      }
    }

    return conflictos;
  } catch (error) {
    throw error;
  }
};

/**
 * Obtener disponibilidad real (horarios no asignados) para un día
 * @param {String} dia - Día de la semana
 * @returns {Array} - Bloques de disponibilidad del sistema de disponibilidad original
 */
profesorSchema.methods.obtenerDisponibilidadOriginal = function(dia) {
  if (!this.disponibilidad || !this.disponibilidad[dia]) {
    return [];
  }
  
  return this.disponibilidad[dia].map(bloque => ({
    inicio: bloque.inicio,
    fin: bloque.fin,
    tipo: 'disponibilidad_original'
  }));
};

/**
 * Obtener resumen de horarios por día
 * @returns {Promise<Object>} - Objeto con horarios agrupados por día
 */
profesorSchema.methods.obtenerResumenHorariosPorDia = async function() {
  try {
    await this.populate('horariosPermitidos');
    
    const resumen = {};
    const dias = ['lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado', 'domingo'];
    
    // Inicializar días
    dias.forEach(dia => {
      resumen[dia] = [];
    });
    
    // Agrupar horarios por día
    this.horariosPermitidos.forEach(horario => {
      if (resumen[horario.dia]) {
        resumen[horario.dia].push({
          _id: horario._id,
          horaInicio: horario.horaInicio,
          horaFin: horario.horaFin,
          tipo: horario.tipo,
          descripcion: horario.descripcion
        });
      }
    });
    
    // Ordenar horarios de cada día por hora de inicio
    Object.keys(resumen).forEach(dia => {
      resumen[dia].sort((a, b) => a.horaInicio.localeCompare(b.horaInicio));
    });
    
    return resumen;
  } catch (error) {
    throw error;
  }
};

// Static method para obtener profesores con horarios específicos
profesorSchema.statics.findWithHorarios = function(filter = {}) {
  return this.find(filter).populate('horariosPermitidos especialidades', 'dia horaInicio horaFin descripcion tipo name code');
};

// Static method para buscar profesores disponibles en cierto horario
profesorSchema.statics.findDisponiblesEnHorario = async function(dia, horaInicio, horaFin) {
  try {
    const profesores = await this.find({ role: 'profesor' }).populate('horariosPermitidos');
    const disponibles = [];
    
    for (const profesor of profesores) {
      const conflictos = await profesor.verificarConflictos({ dia, horaInicio, horaFin });
      if (conflictos.length === 0) {
        disponibles.push(profesor);
      }
    }
    
    return disponibles;
  } catch (error) {
    throw error;
  }
};

// create the model
const Profesor = BaseUser.discriminator('profesor', profesorSchema);

module.exports = Profesor;