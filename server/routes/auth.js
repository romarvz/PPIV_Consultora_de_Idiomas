const express = require('express');
const router = express.Router();

// Importar controladores
const {
  register,
  login,
  getProfile,
  updateProfile,
  changePassword,
  logout
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
  validateChangePassword
} = require('../validators/authValidators');


router.get('/test', (req, res) => {
  res.json({
    success: true,
    message: 'Auth routes working correctly',
    timestamp: new Date().toISOString()
  });
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

module.exports = router;