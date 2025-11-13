const express = require('express');
const router = express.Router();
const {
  getStudents,
  getStudentById,
  updateStudent,
  deactivateStudent,
  reactivateStudent,
  getStudentsStats
} = require('../controllers/studentController');
const { authenticateToken, requireAdmin } = require('../middleware/authMiddlewareNew');
const { body, param } = require('express-validator');

// Validators

const validateStudentUpdate = [
  body('firstName')
    .optional({ values: 'falsy' })
    .custom((value) => {
      if (value === undefined || value === null || value === '') return true;
      if (typeof value !== 'string') return false;
      const trimmed = value.trim();
      return trimmed.length >= 2 && trimmed.length <= 50;
    })
    .withMessage('Nombre debe tener entre 2 y 50 caracteres'),
  body('lastName')
    .optional({ values: 'falsy' })
    .custom((value) => {
      if (value === undefined || value === null || value === '') return true;
      if (typeof value !== 'string') return false;
      const trimmed = value.trim();
      return trimmed.length >= 2 && trimmed.length <= 50;
    })
    .withMessage('Apellido debe tener entre 2 y 50 caracteres'),
  body('email')
    .optional({ values: 'falsy' })
    .isEmail()
    .withMessage('Debe ser un email válido'),
  body('phone')
    .optional({ values: 'falsy' })
    .custom((value) => {
      if (value === undefined || value === null || value === '') return true;
      // Permitir formato más flexible para teléfonos
      const phoneRegex = /^[\+]?[0-9\s\-\(\)]{8,15}$/;
      return phoneRegex.test(value);
    })
    .withMessage('Teléfono debe tener entre 8 y 15 dígitos'),
  body('dni')
    .optional({ values: 'falsy' })
    .custom((value) => {
      if (value === undefined || value === null || value === '') return true;
      const dniStr = String(value).trim();
      return dniStr.length >= 6 && dniStr.length <= 20;
    })
    .withMessage('DNI debe tener entre 6 y 20 caracteres'),
  body('nivel')
    .optional({ values: 'falsy' })
    .isIn(['A1', 'A2', 'B1', 'B2', 'C1', 'C2'])
    .withMessage('Nivel debe ser: A1, A2, B1, B2, C1 o C2'),
  body('condicion')
    .optional({ values: 'falsy' })
    .isIn(['activo', 'inactivo', 'graduado'])
    .withMessage('Condición debe ser: activo, inactivo o graduado'),
  body('estadoAcademico')
    .optional({ values: 'falsy' })
    .isIn(['inscrito', 'en_curso', 'graduado', 'suspendido'])
    .withMessage('Estado académico inválido'),
  body('isActive')
    .optional({ values: 'falsy' })
    .isBoolean()
    .withMessage('isActive debe ser un booleano')
];

const validateId = [param('id').isMongoId()];

// Routes
router.get('/stats', authenticateToken, requireAdmin, getStudentsStats);
router.get('/', authenticateToken, requireAdmin, getStudents);
router.get('/:id', authenticateToken, requireAdmin, validateId, getStudentById);
router.put('/:id', authenticateToken, requireAdmin, validateId, validateStudentUpdate, updateStudent);
router.delete('/:id', authenticateToken, requireAdmin, validateId, deactivateStudent);
router.patch('/:id/reactivate', authenticateToken, requireAdmin, validateId, reactivateStudent);

module.exports = router;