const express = require('express');
const router = express.Router();
const {
  getTeachers,
  getTeacherById,
  updateTeacher,
  deactivateTeacher,
  reactivateTeacher,
  deleteTeacher,
  getTeachersStats
} = require('../controllers/teacherController');
const { authenticateToken, requireAdmin } = require('../middleware/authMiddlewareNew');
const { body, param } = require('express-validator');
const Language = require('../models/Language');
const Horario = require('../models/Horario');

const validateLanguageObjectId = async (value) => {
  const language = await Language.findById(value);
  if (!language) throw new Error('Language not found');
  if (!language.isActive) throw new Error('Language is not active');
  return true;
};

const validateHorarioObjectId = async (value) => {
  const horario = await Horario.findById(value);
  if (!horario) throw new Error('Horario no encontrado');
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
  body('horariosPermitidos')
    .optional()
    .isArray()
    .withMessage('horariosPermitidos debe ser un array'),
  body('horariosPermitidos.*')
    .optional()
    .isMongoId()
    .custom(validateHorarioObjectId)
    .withMessage('ID de horario inválido'),
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
router.patch('/:id/deactivate', authenticateToken, requireAdmin, validateId, deactivateTeacher);
router.delete('/:id', authenticateToken, requireAdmin, validateId, deleteTeacher);
router.patch('/:id/reactivate', authenticateToken, requireAdmin, validateId, reactivateTeacher);

module.exports = router;