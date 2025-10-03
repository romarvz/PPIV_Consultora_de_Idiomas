const { BaseUser, getUserModel } = require('../models');
const jwt = require('jsonwebtoken');

// Crear usuario
async function createUser(data) {
  const UserModel = getUserModel(data.role);
  const user = new UserModel(data);
  await user.save();
  return user;
}

// Buscar usuario por email
async function findUserByEmail(email) {
  return await BaseUser.findOne({ email });
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
  return await BaseUser.findById(userId).select('-password');
}

// Buscar usuario por ID (incluye password para validaciones)
async function findUserById(userId) {
  return await BaseUser.findById(userId);
}

// Actualizar usuario
async function updateUser(userId, updateData) {
  // Si se está actualizando la contraseña, usar findById y save para activar middleware
  if (updateData.password) {
    const user = await BaseUser.findById(userId);
    if (!user) {
      throw new Error('Usuario no encontrado');
    }
    
    // Actualizar campos
    Object.keys(updateData).forEach(key => {
      user[key] = updateData[key];
    });
    
    await user.save();
    return await BaseUser.findById(userId).select('-password');
  }
  
  // Para otras actualizaciones, usar findByIdAndUpdate
  return await BaseUser.findByIdAndUpdate(userId, updateData, { new: true }).select('-password');
}

// Buscar usuarios con filtros
async function findUsersWithFilters(filters, skip = 0, limit = 10) {
  return await BaseUser.find(filters)
    .select('-password')
    .skip(skip)
    .limit(limit)
    .sort({ createdAt: -1 });
}

// Contar usuarios con filtros
async function countUsersWithFilters(filters) {
  return await BaseUser.countDocuments(filters);
}

// Buscar usuarios con paginación y filtros avanzados
async function findUsers(filters, options = {}) {
  const {
    page = 1,
    limit = 10,
    sort = { createdAt: -1 },
    select = '-password'
  } = options;

  const skip = (page - 1) * limit;
  
  const [docs, totalDocs] = await Promise.all([
    BaseUser.find(filters)
      .select(select)
      .sort(sort)
      .skip(skip)
      .limit(limit),
    BaseUser.countDocuments(filters)
  ]);

  const totalPages = Math.ceil(totalDocs / limit);
  const hasNextPage = page < totalPages;
  const hasPrevPage = page > 1;

  return {
    docs,
    totalDocs,
    limit,
    page,
    totalPages,
    hasNextPage,
    hasPrevPage
  };
}

// Contar usuarios con filtros específicos
async function countUsers(filters) {
  return await BaseUser.countDocuments(filters);
}

// Estadísticas agregadas
async function getAggregateStats(pipeline) {
  return await BaseUser.aggregate(pipeline);
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
  countUsersWithFilters,
  findUsers,
  countUsers,
  getAggregateStats
};
