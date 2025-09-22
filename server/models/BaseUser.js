const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Schema base para todos los usuarios
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
    sparse: true // Permite que los admins no tengan DNI
  },
  mustChangePassword: {
    type: Boolean,
    default: function() {
      return this.role === 'estudiante' || this.role === 'profesor';
    }
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
  }
}, {
  timestamps: true,
  discriminatorKey: 'role', // Campo que distingue los tipos
  collection: 'users' // Todos van en la misma colección
});

// Middleware para hash de password ANTES de guardar
baseUserSchema.pre('save', async function(next) {
  // Solo hashear si el password fue modificado (o es nuevo)
  if (!this.isModified('password')) return next();
  
  try {
    // Hash del password con salt de 12 rounds
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Método para comparar passwords
baseUserSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Método para obtener info pública del usuario (sin password)
baseUserSchema.methods.toJSON = function() {
  const userObject = this.toObject();
  delete userObject.password;
  delete userObject.__v;
  return userObject;
};

// Método para obtener el nombre completo
baseUserSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`;
});

// Crear el modelo base solo si no existe
const BaseUser = mongoose.models.User || mongoose.model('User', baseUserSchema);

module.exports = BaseUser;