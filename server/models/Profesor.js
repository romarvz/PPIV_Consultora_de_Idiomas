const mongoose = require('mongoose');
const BaseUser = require('./BaseUser');

// Schema específico para profesores
const profesorSchema = new mongoose.Schema({
  especialidades: [{
    type: String,
    enum: ['ingles', 'frances', 'aleman', 'italiano', 'portugues', 'espanol'],
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

// Crear el modelo Profesor usando discriminator
const Profesor = BaseUser.discriminator('profesor', profesorSchema);

module.exports = Profesor;