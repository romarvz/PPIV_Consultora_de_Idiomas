const express = require('express');
const router = express.Router();

// Importar controladores CRUD
const {
  // Estudiantes
  getStudents,
  getStudentById,
  updateStudent,
  deactivateStudent,
  reactivateStudent,
  getStudentsStats,
  
  // Profesores
  getTeachers,
  getTeacherById,
  updateTeacher,
  deactivateTeacher,
  reactivateTeacher,
  getTeachersStats
} = require('../controllers/crudController');

// Importar middlewares
const { 
  authenticateToken, 
  requireAdmin 
} = require('../middleware/authMiddlewareNew');

// Importar validadores
const { body, param } = require('express-validator');

// ==================== VALIDADORES ====================

const validateStudentUpdate = [
  body('firstName')
    .optional()
    .isLength({ min: 2, max: 50 })
    .withMessage('El nombre debe tener entre 2 y 50 caracteres'),
    
  body('lastName')
    .optional()
    .isLength({ min: 2, max: 50 })
    .withMessage('El apellido debe tener entre 2 y 50 caracteres'),
    
  body('email')
    .optional()
    .isEmail()
    .withMessage('Debe ser un email válido'),
    
  body('phone')
    .optional()
    .matches(/^\+?[1-9]\d{1,14}$/)
    .withMessage('El teléfono debe ser un número válido'),
    
  body('dni')
    .optional()
    .isLength({ min: 6, max: 20 })
    .withMessage('El DNI debe tener entre 6 y 20 caracteres'),
    
  body('nivel')
    .optional()
    .isIn(['A1', 'A2', 'B1', 'B2', 'C1', 'C2'])
    .withMessage('El nivel debe ser uno de: A1, A2, B1, B2, C1, C2'),
    
  body('condicion')
    .optional()
    .isIn(['activo', 'inactivo', 'graduado'])
    .withMessage('La condición debe ser: activo, inactivo o graduado'),
    
  body('estadoAcademico')
    .optional()
    .isIn(['activo', 'suspendido', 'graduado'])
    .withMessage('El estado académico debe ser: activo, suspendido o graduado'),
    
  body('isActive')
    .optional()
    .isBoolean()
    .withMessage('isActive debe ser un valor booleano')
];

const validateTeacherUpdate = [
  body('firstName')
    .optional()
    .isLength({ min: 2, max: 50 })
    .withMessage('El nombre debe tener entre 2 y 50 caracteres'),
    
  body('lastName')
    .optional()
    .isLength({ min: 2, max: 50 })
    .withMessage('El apellido debe tener entre 2 y 50 caracteres'),
    
  body('email')
    .optional()
    .isEmail()
    .withMessage('Debe ser un email válido'),
    
  body('phone')
    .optional()
    .matches(/^\+?[1-9]\d{1,14}$/)
    .withMessage('El teléfono debe ser un número válido'),
    
  body('especialidades')
    .optional()
    .isArray({ min: 1 })
    .withMessage('Debe seleccionar al menos una especialidad'),
    
  body('especialidades.*')
    .optional()
    .isIn(['ingles', 'frances', 'aleman', 'italiano', 'portugues', 'espanol'])
    .withMessage('Especialidad no válida'),
    
  body('tarifaPorHora')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('La tarifa debe ser un número mayor o igual a 0'),
    
  body('disponible')
    .optional()
    .isBoolean()
    .withMessage('disponible debe ser un valor booleano'),
    
  body('condicion')
    .optional()
    .isIn(['activo', 'inactivo'])
    .withMessage('Condición debe ser activo o inactivo'),
    
  body('isActive')
    .optional()
    .isBoolean()
    .withMessage('isActive debe ser un valor booleano')
];

const validateId = [
  param('id')
    .isMongoId()
    .withMessage('ID no válido')
];

// ==================== RUTAS DE ESTUDIANTES ====================

// Estadísticas de estudiantes
router.get('/students/stats', 
  authenticateToken, 
  requireAdmin, 
  getStudentsStats
);

// Listar estudiantes con filtros
router.get('/students', 
  authenticateToken, 
  requireAdmin, 
  getStudents
);

// Obtener estudiante por ID
router.get('/students/:id', 
  authenticateToken, 
  requireAdmin, 
  validateId,
  getStudentById
);

// Actualizar estudiante
router.put('/students/:id', 
  authenticateToken, 
  requireAdmin, 
  validateId,
  validateStudentUpdate,
  updateStudent
);

// Desactivar estudiante (soft delete)
router.delete('/students/:id', 
  authenticateToken, 
  requireAdmin, 
  validateId,
  deactivateStudent
);

// Reactivar estudiante
router.patch('/students/:id/reactivate', 
  authenticateToken, 
  requireAdmin, 
  validateId,
  reactivateStudent
);

// ==================== RUTAS DE PROFESORES ====================

// Estadísticas de profesores
router.get('/teachers/stats', 
  authenticateToken, 
  requireAdmin, 
  getTeachersStats
);

// Listar profesores con filtros
router.get('/teachers', 
  authenticateToken, 
  requireAdmin, 
  getTeachers
);

// Obtener profesor por ID
router.get('/teachers/:id', 
  authenticateToken, 
  requireAdmin, 
  validateId,
  getTeacherById
);

// Actualizar profesor
router.put('/teachers/:id', 
  authenticateToken, 
  requireAdmin, 
  validateId,
  validateTeacherUpdate,
  updateTeacher
);

// Desactivar profesor (soft delete)
router.delete('/teachers/:id', 
  authenticateToken, 
  requireAdmin, 
  validateId,
  deactivateTeacher
);

// Reactivar profesor
router.patch('/teachers/:id/reactivate', 
  authenticateToken, 
  requireAdmin, 
  validateId,
  reactivateTeacher
);

// ==================== RUTAS DE UTILIDAD ====================

// Test de conectividad
router.get('/test', (req, res) => {
  res.json({
    success: true,
    message: 'CRUD routes working correctly',
    timestamp: new Date().toISOString()
  });
});

module.exports = router;