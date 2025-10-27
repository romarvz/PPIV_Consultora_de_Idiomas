const express = require('express');
const router = express.Router();
const {
  getTeachers,
  getTeacherById,
  updateTeacher,
  deactivateTeacher,
  reactivateTeacher,
  getTeachersStats
} = require('../controllers/teacherController');
const { authenticateToken, requireAdmin } = require('../middleware/authMiddlewareNew');
const { body, param } = require('express-validator');
const Language = require('../models/Language');

const validateLanguageObjectId = async (value) => {
  const language = await Language.findById(value);
  if (!language) throw new Error('Language not found');
  if (!language.isActive) throw new Error('Language is not active');
  return true;
};

// Validators

const validateTeacherUpdate = [
  body('firstName').optional().isLength({ min: 2, max: 50 }),
  body('lastName').optional().isLength({ min: 2, max: 50 }),
  body('email').optional().isEmail(),
  body('phone').optional().matches(/^\+?[1-9]\d{1,14}$/),
  body('especialidades').optional().isArray({ min: 1 }),
  body('especialidades.*').optional().isMongoId().custom(validateLanguageObjectId),
  body('tarifaPorHora').optional().isFloat({ min: 0 }),
  body('disponible').optional().isBoolean(),
  body('condicion').optional().isIn(['activo', 'inactivo']),
  body('isActive').optional().isBoolean()
];

const validateId = [param('id').isMongoId()];

// Routes
router.get('/stats', authenticateToken, requireAdmin, getTeachersStats);
router.get('/', authenticateToken, requireAdmin, getTeachers);
router.get('/:id', authenticateToken, requireAdmin, validateId, getTeacherById);
router.put('/:id', authenticateToken, requireAdmin, validateId, validateTeacherUpdate, updateTeacher);
router.delete('/:id', authenticateToken, requireAdmin, validateId, deactivateTeacher);
router.patch('/:id/reactivate', authenticateToken, requireAdmin, validateId, reactivateTeacher);

module.exports = router;