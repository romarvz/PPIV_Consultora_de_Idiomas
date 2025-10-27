const mongoose = require('mongoose');

// Schema for Language documents
const languageSchema = new mongoose.Schema({
  code: {
    type: String,
    required: [true, 'Código de idioma es requerido'],
    unique: true,
    lowercase: true,
    trim: true,
    minlength: [2, 'Código debe tener al menos 2 caracteres'],
    maxlength: [5, 'Código no puede exceder 5 caracteres']
  },
  name: {
    type: String,
    required: [true, 'Nombre del idioma es requerido'],
    trim: true,
    minlength: [2, 'Nombre debe tener al menos 2 caracteres'],
    maxlength: [50, 'Nombre no puede exceder 50 caracteres']
  },
  nativeName: {
    type: String,
    trim: true,
    maxlength: [50, 'Nombre nativo no puede exceder 50 caracteres']
  },
  isActive: {
    type: Boolean,
    default: true
  },
  description: {
    type: String,
    trim: true,
    maxlength: [200, 'Descripción no puede exceder 200 caracteres']
  },
  level: {
    type: String,
    enum: ['basico', 'intermedio', 'avanzado', 'nativo'],
    default: 'basico'
  },
  demandLevel: {
    type: String,
    enum: ['bajo', 'medio', 'alto'],
    default: 'medio'
  }
}, {
  timestamps: true,
  collection: 'languages'
});

// optimizations
languageSchema.index({ code: 1 });
languageSchema.index({ isActive: 1 });
languageSchema.index({ name: 1 });

//static method to get all active languages
languageSchema.statics.getActiveLanguages = function() {
  return this.find({ isActive: true }).sort({ name: 1 });
};

// static method to find by code
languageSchema.statics.findByCode = function(code) {
  return this.findOne({ code: code.toLowerCase() });
};

// MMethod to toggle active status
languageSchema.methods.toggleActive = function() {
  this.isActive = !this.isActive;
  return this.save();
};

// Middleware pre-save for validations and transformations
languageSchema.pre('save', function(next) {
  
  if (this.name) {
    this.name = this.name.charAt(0).toUpperCase() + this.name.slice(1).toLowerCase();
  }
  
  // validations
  if (this.code && !/^[a-z0-9]+$/.test(this.code)) {
    return next(new Error('El código solo puede contener letras minúsculas y números'));
  }
  
  next();
});

// Méthod toJSON for API responses
languageSchema.methods.toJSON = function() {
  const language = this.toObject();
  return {
    _id: language._id,
    code: language.code,
    name: language.name,
    nativeName: language.nativeName,
    isActive: language.isActive,
    description: language.description,
    level: language.level,
    demandLevel: language.demandLevel,
    createdAt: language.createdAt,
    updatedAt: language.updatedAt
  };
};

const Language = mongoose.model('Language', languageSchema);

module.exports = Language;