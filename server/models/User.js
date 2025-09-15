const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: [true, 'Email es requerido'],
    unique: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Email inválido']
  },
  password: {
    type: String,
    required: [true, 'Password es requerido'],
    minlength: [6, 'Password debe tener al menos 6 caracteres']
  },
  firstName: {
    type: String,
    required: [true, 'Nombre es requerido'],
    trim: true
  },
  lastName: {
    type: String,
    required: [true, 'Apellido es requerido'],
    trim: true
  },
  role: {
    type: String,
    enum: ['admin', 'profesor', 'estudiante'],
    default: 'estudiante'
  },
  phone: {
    type: String,
    trim: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  
  // Campos específicos para ESTUDIANTES
  nivel: {
    type: String,
    enum: ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'],
    required: function() { 
      return this.role === 'estudiante'; 
    }
  },
  estadoAcademico: {
    type: String,
    enum: ['inscrito', 'en_curso', 'graduado', 'suspendido'],
    default: function() { 
      return this.role === 'estudiante' ? 'inscrito' : undefined; 
    }
  },
  
  // Campos específicos para PROFESORES
  especialidades: [{
    type: String,
    enum: ['ingles', 'frances', 'aleman', 'italiano', 'portugues', 'espanol']
  }],
  tarifaPorHora: {
    type: Number,
    min: [0, 'La tarifa no puede ser negativa'],
    required: function() { 
      return this.role === 'profesor'; 
    }
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
  },
  
  createdAt: {
    type: Date,
    default: Date.now
  },
  lastLogin: {
    type: Date
  }
}, {
  timestamps: true
});

// Crear índice para email
userSchema.index({ email: 1 });

// Hash password antes de guardar
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Método para comparar passwords
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Excluir password y __v al convertir a JSON
userSchema.methods.toJSON = function() {
  const userObject = this.toObject();
  delete userObject.password;
  delete userObject.__v;
  return userObject;
};

module.exports = mongoose.model('User', userSchema);