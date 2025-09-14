const User = require('../models/User');
const jwt = require('jsonwebtoken');

// Crear usuario
async function createUser(data) {
  const user = new User(data);
  await user.save();
  return user;
}

// Buscar usuario por email
async function findUserByEmail(email) {
  return await User.findOne({ email });
}

// Validar contraseña
async function validatePassword(user, password) {
  return await user.comparePassword(password);
}

// Generar token JWT
function generateToken(userId) {
  return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '7d' });
}

// Buscar usuario por ID (sin password)
async function getUserProfile(userId) {
  return await User.findById(userId).select('-password');
}

module.exports = {
  createUser,
  findUserByEmail,
  validatePassword,
  generateToken,
  getUserProfile
};
