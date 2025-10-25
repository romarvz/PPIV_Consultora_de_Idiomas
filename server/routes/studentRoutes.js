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
  body('firstName').optional().isLength({ min: 2, max: 50 }),
  body('lastName').optional().isLength({ min: 2, max: 50 }),
  body('email').optional().isEmail(),
  body('phone').optional().matches(/^\+?[1-9]\d{1,14}$/),
  body('dni').optional().isLength({ min: 6, max: 20 }),
  body('nivel').optional().isIn(['A1', 'A2', 'B1', 'B2', 'C1', 'C2']),
  body('condicion').optional().isIn(['activo', 'inactivo', 'graduado']),
  body('estadoAcademico').optional().isIn(['activo', 'suspendido', 'graduado']),
  body('isActive').optional().isBoolean()
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