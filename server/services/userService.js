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
  console.log('userService.updateUser - userId:', userId);
  console.log('userService.updateUser - updateData:', JSON.stringify(updateData, null, 2));
  
  // Usar siempre findById + save para asegurar que los arrays se actualicen correctamente
  const user = await BaseUser.findById(userId);
  if (!user) {
    throw new Error('Usuario no encontrado');
  }
  
  console.log('userService.updateUser - user before update:', JSON.stringify(user.toJSON(), null, 2));
  
  // Actualizar campos
  Object.keys(updateData).forEach(key => {
    user[key] = updateData[key];
  });
  
  console.log('userService.updateUser - user after field updates:', JSON.stringify(user.toJSON(), null, 2));
  
  await user.save();
  
  const result = await BaseUser.findById(userId).select('-password');
  console.log('userService.updateUser - final result:', JSON.stringify(result.toJSON(), null, 2));
  return result;
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
