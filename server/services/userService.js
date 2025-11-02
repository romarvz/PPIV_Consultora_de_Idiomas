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
  const query = BaseUser.findById(userId).select('-password');
  const user = await query.exec();
  
  if (user && user.role === 'profesor') {
    await user.populate('especialidades', 'code name nativeName isActive');
    await user.populate('horariosPermitidos');
  }
  
  return user;
}

// Buscar usuario por ID (incluye password para validaciones)
async function findUserById(userId) {
  const user = await BaseUser.findById(userId);
  if (user && user.role === 'profesor') {
    await user.populate('especialidades', 'code name nativeName isActive');
    await user.populate('horariosPermitidos');
  }
  return user;
}

// Actualizar usuario
async function updateUser(userId, updateData) {
  // Usar siempre findById + save para asegurar que los arrays se actualicen correctamente
  const user = await BaseUser.findById(userId);
  if (!user) {
    throw new Error('Usuario no encontrado');
  }
  
  // Actualizar campos
  Object.keys(updateData).forEach(key => {
    user[key] = updateData[key];
  });
  
  await user.save();
  
  const result = await BaseUser.findById(userId).select('-password');
  return result;
}

// Buscar usuarios con filtros
async function findUsersWithFilters(filters, skip = 0, limit = 10) {
  const query = BaseUser.find(filters)
    .select('-password')
    .skip(skip)
    .limit(limit)
    .sort({ createdAt: -1 });
  
  // Si es consulta de profesores, popular las especialidades
  if (filters.role === 'profesor') {
    query.populate('especialidades', 'code name nativeName isActive');
  }
  
  return await query.exec();
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
  
  const query = BaseUser.find(filters)
    .select(select)
    .sort(sort)
    .skip(skip)
    .limit(limit);

  // Si es consulta de profesores, popular las especialidades y horarios
  if (filters.role === 'profesor') {
    query.populate('especialidades', 'code name nativeName isActive');
    query.populate('horariosPermitidos');
  }

  const [docs, totalDocs] = await Promise.all([
    query.exec(),
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
