const express = require('express');
const router = express.Router();

// Importar controladores nuevos
const {
  register,
  login,
  getProfile,
  updateProfile,
  changePassword,
  changePasswordForced,
  logout,
  getStudents,
  getProfessors,
  updateAcademicInfo,
  updateTeachingInfo,
  deactivateUser,
  reactivateUser,
  deleteUser
} = require('../controllers/authControllerNew');

// Importar middlewares
const { 
  authenticateToken, 
  requireAdmin 
} = require('../middleware/authMiddlewareNew');

// Importar validadores nuevos
const {
  validateRegisterEstudiante,
  validateRegisterProfesor,
  validateRegisterAdmin,
  validateRegisterEstudianteFromAdmin,
  validateRegisterProfesorFromAdmin,
  validateLogin,
  validateUpdateProfile,
  validateChangePassword,
  validateChangePasswordForced,
  validateUpdateAcademicInfo,
  validateUpdateTeachingInfo,
  getValidationForRole
} = require('../validators/authValidatorsNew');

// Importar modelos para funciones auxiliares
const { Admin } = require('../models');

// ==================== RUTAS DE PRUEBA ====================

router.get('/test', (req, res) => {
  res.json({
    success: true,
    message: 'New auth routes working correctly',
    timestamp: new Date().toISOString()
  });
});

// ==================== CREAR PRIMER ADMIN ====================

router.post('/create-first-admin', async (req, res) => {
  try {
    // Verificar si ya existe un admin
    const existingAdmin = await Admin.findOne({ role: 'admin' });
    if (existingAdmin) {
      return res.status(400).json({
        success: false,
        message: 'Ya existe un administrador en el sistema',
        code: 'ADMIN_EXISTS'
      });
    }

    const { email, password, firstName, lastName, dni } = req.body;

    // Validaciones básicas
    if (!email || !password || !firstName || !lastName || !dni) {
      return res.status(400).json({
        success: false,
        message: 'Todos los campos son requeridos'
      });
    }

    // Crear primer admin
    const admin = new Admin({
      email,
      password,
      firstName,
      lastName,
      dni,
      role: 'admin',
      mustChangePassword: false // El primer admin no necesita cambiar password
    });

    await admin.save();

    res.status(201).json({
      success: true,
      message: 'Primer administrador creado exitosamente',
      data: {
        admin: admin.toJSON()
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

// ==================== TEST DE BASE DE DATOS ====================

router.get('/db-test', async (req, res) => {
  try {
    const mongoose = require('mongoose');
    
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

// ==================== MIDDLEWARE PARA VALIDACIÓN DINÁMICA ====================

// Middleware para validar según el rol en el body
const validateByRole = (req, res, next) => {
  const role = req.body.role || 'estudiante';
  const isFromAdmin = req.header('Authorization') ? true : false;
  
  // Obtener las validaciones correctas para el rol
  const validations = getValidationForRole(role, isFromAdmin);
  
  // Ejecutar las validaciones
  Promise.all(validations.map(validation => validation.run(req)))
    .then(() => next())
    .catch(next);
};

// ==================== RUTAS DE REGISTRO ====================

// Registro público de estudiantes
router.post('/register/estudiante', validateRegisterEstudiante, register);

// Registro de estudiantes por admin (sin password, usa DNI)
router.post('/register/estudiante-admin', 
  authenticateToken, 
  requireAdmin, 
  validateRegisterEstudianteFromAdmin, 
  register
);

// Registro de profesores (solo admin)
router.post('/register/profesor', 
  authenticateToken, 
  requireAdmin, 
  validateRegisterProfesorFromAdmin, 
  register
);

// Registro de administradores (solo admin)
router.post('/register/admin', 
  authenticateToken, 
  requireAdmin, 
  validateRegisterAdmin, 
  register
);

// Registro genérico (mantener compatibilidad)
router.post('/register', 
  authenticateToken, 
  requireAdmin, 
  validateByRole, 
  register
);

// ==================== RUTAS DE AUTENTICACIÓN ====================

router.post('/login', validateLogin, login);

router.post('/logout', authenticateToken, logout);

router.get('/verify-token', authenticateToken, (req, res) => {
  res.json({
    success: true,
    message: 'Token válido',
    data: {
      user: req.user
    }
  });
});

// ==================== RUTAS DE PERFIL ====================

router.get('/profile', authenticateToken, getProfile);

router.put('/profile', authenticateToken, validateUpdateProfile, updateProfile);

// ==================== RUTAS DE CONTRASEÑA ====================

router.put('/change-password', authenticateToken, validateChangePassword, changePassword);

router.put('/change-password-forced', authenticateToken, validateChangePasswordForced, changePasswordForced);

// ==================== RUTAS DE USUARIOS POR ROL ====================

// Obtener estudiantes (todos los usuarios autenticados)
router.get('/students', authenticateToken, getStudents);

// Obtener profesores (solo admin)
router.get('/professors', authenticateToken, requireAdmin, getProfessors);

// ==================== RUTAS DE ACTUALIZACIÓN ESPECÍFICA ====================

// Actualizar información académica (solo estudiantes)
router.put('/update-academic-info', authenticateToken, validateUpdateAcademicInfo, updateAcademicInfo);

// Actualizar información de enseñanza (solo profesores)
router.put('/update-teaching-info', authenticateToken, validateUpdateTeachingInfo, updateTeachingInfo);

// ==================== RUTAS DE GESTIÓN DE USUARIOS (SOLO ADMIN) ====================

// Desactivar usuario (soft delete)
router.put('/deactivate/:id', authenticateToken, requireAdmin, deactivateUser);

// Reactivar usuario
router.put('/reactivate/:id', authenticateToken, requireAdmin, reactivateUser);

// Eliminar usuario permanentemente (hard delete)
router.delete('/delete/:id', authenticateToken, requireAdmin, deleteUser);

module.exports = router;