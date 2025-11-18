const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Base Schema  for all users
const baseUserSchema = new mongoose.Schema({
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
    required: true
  },
  phone: {
    type: String,
    trim: true
  },
  dni: {
    type: String,
    required: function() { 
      return this.role === 'estudiante' || this.role === 'profesor'; 
    },
    trim: true,
    unique: true,
    sparse: true 
  },
  mustChangePassword: {
    type: Boolean,
    default: function() {
      return this.role === 'estudiante' || this.role === 'profesor';
    }
  },
  condicion: {
    type: String,
    enum: ['activo', 'inactivo', 'graduado'],
    default: 'activo'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  lastLogin: {
    type: Date
  },

  // --- NUEVO CAMPO (PUNTO 2) ---
  // Solo aplica para 'profesor'.
  // Almacena los IDs de los horarios que el profesor ESTÁ DISPUESTO a dar.
  horariosPermitidos: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Horario'
  }]
  // --- FIN NUEVO CAMPO ---

}, {
  timestamps: true,
  discriminatorKey: 'role', 
  collection: 'users' 
});

// Middleware for hashing password BEFORE saving
baseUserSchema.pre('save', async function(next) {
  // Only hash if the password was modified (or is new)
  if (!this.isModified('password')) return next();
  
  try {
    // Hash the password with a salt of 12 rounds
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare passwords
baseUserSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// MMethod to get public user info (without password)
baseUserSchema.methods.toJSON = function() {
  const userObject = this.toObject();
  delete userObject.password;
  delete userObject.__v;
  return userObject;
};

// MMethod to get full name
baseUserSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`;
});

// Create the base model only if it doesn't exist
const BaseUser = mongoose.models.BaseUser || mongoose.model('BaseUser', baseUserSchema);

module.exports = BaseUser;