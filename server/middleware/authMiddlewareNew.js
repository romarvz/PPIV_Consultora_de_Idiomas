const jwt = require('jsonwebtoken');
const { findUserById } = require('../models');

// JWT authentication middleware
const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.header('Authorization');
    const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;

    if (!token) {
      return res.status(401).json({ success: false, message: 'Access token required', code: 'NO_TOKEN' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'mi_clave_secreta');
    const user = await findUserById(decoded.id);
    
    if (!user || !user.isActive) {
      return res.status(401).json({ success: false, message: 'Invalid token', code: 'INVALID_TOKEN' });
    }

    req.user = {
      id: user._id,
      userId: user._id,
      email: user.email,
      role: user.role,
      firstName: user.firstName,
      lastName: user.lastName,
      fullUser: user
    };

    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ success: false, message: 'Token expired', code: 'TOKEN_EXPIRED' });
    }
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ success: false, message: 'Invalid token', code: 'INVALID_TOKEN' });
    }
    return res.status(500).json({ success: false, message: 'Internal server error', code: 'INTERNAL_ERROR' });
  }
};

// Admin role middleware
const requireAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ success: false, message: 'Not authenticated', code: 'NOT_AUTHENTICATED' });
  }
  if (req.user.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Admin access required', code: 'INSUFFICIENT_PERMISSIONS' });
  }
  next();
};

// Professor role middleware
const requireProfesor = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ success: false, message: 'Not authenticated', code: 'NOT_AUTHENTICATED' });
  }
  if (req.user.role !== 'profesor') {
    return res.status(403).json({ success: false, message: 'Professor access required', code: 'INSUFFICIENT_PERMISSIONS' });
  }
  next();
};

// Student role middleware
const requireEstudiante = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ success: false, message: 'Not authenticated', code: 'NOT_AUTHENTICATED' });
  }
  if (req.user.role !== 'estudiante') {
    return res.status(403).json({ success: false, message: 'Student access required', code: 'INSUFFICIENT_PERMISSIONS' });
  }
  next();
};

// Multiple roles middleware
const requireRole = (roles) => (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ success: false, message: 'Not authenticated', code: 'NOT_AUTHENTICATED' });
  }
  if (!roles.includes(req.user.role)) {
    return res.status(403).json({ success: false, message: `Required roles: ${roles.join(', ')}`, code: 'INSUFFICIENT_PERMISSIONS' });
  }
  next();
};

// Owner or admin middleware
const requireOwnerOrAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ success: false, message: 'Not authenticated', code: 'NOT_AUTHENTICATED' });
  }
  
  const resourceUserId = req.params.userId || req.body.userId;
  const isOwner = req.user.id.toString() === resourceUserId;
  const isAdmin = req.user.role === 'admin';

  if (!isOwner && !isAdmin) {
    return res.status(403).json({ success: false, message: 'Owner or admin access required', code: 'INSUFFICIENT_PERMISSIONS' });
  }
  next();
};

module.exports = {
  authenticateToken,
  requireAdmin,
  requireProfesor,
  requireEstudiante,
  requireRole,
  requireOwnerOrAdmin
};