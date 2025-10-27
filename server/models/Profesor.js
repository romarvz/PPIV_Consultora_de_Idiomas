const mongoose = require('mongoose');
const BaseUser = require('./BaseUser');

// specific schema for Profesor
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


profesorSchema.pre('validate', function(next) {
  if (this.especialidades && this.especialidades.length === 0) {
    this.invalidate('especialidades', 'Debe tener al menos una especialidad');
  }
  next();
});
profesorSchema.statics.findWithLanguages = function(filter = {}) {
  return this.find(filter).populate('especialidades', 'code name nativeName isActive');
};

// method to get comma-separated language names
profesorSchema.methods.getLanguageNames = function() {
  if (this.especialidades && this.especialidades.length > 0) {
    return this.especialidades.map(lang => lang.name || lang.toString()).join(', ');
  }
  return 'Sin especialidades';
};

// create the model
const Profesor = BaseUser.discriminator('profesor', profesorSchema);

module.exports = Profesor;