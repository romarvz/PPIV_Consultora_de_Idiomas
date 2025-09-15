const express = require('express');
const router = express.Router();

// Importar controladores
const {
  register,
  login,
  getProfile,
  updateProfile,
  changePassword,
  logout,
  getStudents,
  getProfessors,
  updateAcademicInfo,
  updateTeachingInfo
} = require('../controllers/authController');

// Importar middlewares
const { 
  authenticateToken, 
  requireAdmin 
} = require('../middleware/authMiddleware');

// Importar validadores
const {
  validateRegister,
  validateLogin,
  validateUpdateProfile,
  validateChangePassword,
  validateUpdateAcademicInfo,
  validateUpdateTeachingInfo
} = require('../validators/authValidators');


router.get('/test', (req, res) => {
  res.json({
    success: true,
    message: 'Auth routes working correctly',
    timestamp: new Date().toISOString()
  });
});

// ENDPOINT TEMPORAL PARA CREAR PRIMER ADMIN
router.post('/create-first-admin', async (req, res) => {
  try {
    const User = require('../models/User');
    
    // Verificar si ya existe un admin
    const existingAdmin = await User.findOne({ role: 'admin' });
    if (existingAdmin) {
      return res.status(400).json({
        success: false,
        message: 'Ya existe un administrador'
      });
    }

    // Crear primer admin
    const adminData = {
      email: 'admin@consultora.com',
      password: 'Admin123456',
      firstName: 'Super',
      lastName: 'Admin',
      role: 'admin'
    };

    const admin = new User(adminData);
    await admin.save();

    res.status(201).json({
      success: true,
      message: 'Primer administrador creado exitosamente',
      data: {
        email: admin.email,
        role: admin.role
      }
    });

  } catch (error) {
    console.error('Error creando primer admin:', error);
    res.status(500).json({
      success: false,
      message: 'Error creando administrador'
    });
  }
});

router.get('/db-test', async (req, res) => {
  try {
    const mongoose = require('mongoose');
    
    // Test simple: verificar readyState
    const readyState = mongoose.connection.readyState;
    
    if (readyState === 1) {
      res.json({
        success: true,
        message: 'Database connection is ready',
        readyState: readyState
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Database not ready',
        readyState: readyState
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Database test failed',
      error: error.message
    });
  }
});


router.post('/register', validateRegister, register);


router.post('/login', validateLogin, login);


router.post('/logout', authenticateToken, logout);


router.get('/profile', authenticateToken, getProfile);


router.put('/profile', authenticateToken, validateUpdateProfile, updateProfile);


router.put('/change-password', authenticateToken, validateChangePassword, changePassword);


router.get('/verify-token', authenticateToken, (req, res) => {
  res.json({
    success: true,
    message: 'Token válido',
    data: {
      user: req.user
    }
  });
});

// Nuevas rutas para gestión de usuarios por rol
router.get('/students', authenticateToken, getStudents);

router.get('/professors', authenticateToken, requireAdmin, getProfessors);

router.put('/update-academic-info', authenticateToken, validateUpdateAcademicInfo, updateAcademicInfo);

router.put('/update-teaching-info', authenticateToken, validateUpdateTeachingInfo, updateTeachingInfo);

module.exports = router;