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

// Buscar usuario por ID (incluye password para validaciones)
async function findUserById(userId) {
  return await User.findById(userId);
}

// Actualizar usuario
async function updateUser(userId, updateData) {
  return await User.findByIdAndUpdate(userId, updateData, { new: true }).select('-password');
}

// Buscar usuarios con filtros
async function findUsersWithFilters(filters, skip = 0, limit = 10) {
  return await User.find(filters)
    .select('-password')
    .skip(skip)
    .limit(limit)
    .sort({ createdAt: -1 });
}

// Contar usuarios con filtros
async function countUsersWithFilters(filters) {
  return await User.countDocuments(filters);
}

module.exports = {
  createUser,
  findUserByEmail,
  validatePassword,
  generateToken,
  getUserProfile,
  findUserById,
  updateUser,
  findUsersWithFilters,
  countUsersWithFilters
};
