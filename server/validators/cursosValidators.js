// validators/cursosValidators.js
const { body, param, query } = require('express-validator');
const mongoose = require('mongoose');

// Validador personalizado para ObjectId
const isValidObjectId = (value) => {
  return mongoose.Types.ObjectId.isValid(value);
};

// Validaciones para crear curso
exports.validarCreacionCurso = [
  body('nombre')
    .notEmpty().withMessage('El nombre del curso es obligatorio')
    .isLength({ min: 3, max: 100 }).withMessage('El nombre debe tener entre 3 y 100 caracteres')
    .trim(),
  
  body('idioma')
    .notEmpty().withMessage('El idioma es obligatorio')
    .isIn(['ingles', 'frances', 'aleman', 'italiano', 'portugues', 'chino', 'japones', 'coreano'])
    .withMessage('Idioma no válido'),
  
  body('nivel')
    .notEmpty().withMessage('El nivel es obligatorio')
    .isIn(['A1', 'A2', 'B1', 'B2', 'C1', 'C2'])
    .withMessage('Nivel no válido según MCER'),
  
  body('descripcion')
    .optional()
    .isLength({ max: 1000 }).withMessage('La descripción no puede exceder 1000 caracteres')
    .trim(),
  
  body('duracionTotal')
    .notEmpty().withMessage('La duración total es obligatoria')
    .isInt({ min: 10, max: 500 }).withMessage('La duración debe estar entre 10 y 500 horas'),
  
  body('tarifa')
    .notEmpty().withMessage('La tarifa es obligatoria')
    .isFloat({ min: 0 }).withMessage('La tarifa no puede ser negativa'),
  
  body('profesor')
    .notEmpty().withMessage('El profesor es obligatorio')
    .custom(isValidObjectId).withMessage('ID de profesor no válido'),
  
  body('fechaInicio')
    .notEmpty().withMessage('La fecha de inicio es obligatoria')
    .isISO8601().withMessage('Fecha de inicio no válida'),
  
  body('fechaFin')
    .notEmpty().withMessage('La fecha de fin es obligatoria')
    .isISO8601().withMessage('Fecha de fin no válida')
    .custom((fechaFin, { req }) => {
      if (new Date(fechaFin) <= new Date(req.body.fechaInicio)) {
        throw new Error('La fecha de fin debe ser posterior a la fecha de inicio');
      }
      return true;
    }),
  
  body('requisitos')
    .optional()
    .isLength({ max: 500 }).withMessage('Los requisitos no pueden exceder 500 caracteres')
    .trim(),
  
  body('objetivos')
    .optional()
    .isLength({ max: 1000 }).withMessage('Los objetivos no pueden exceder 1000 caracteres')
    .trim(),
  
  body('estado')
    .optional()
    .isIn(['planificado', 'activo', 'completado', 'cancelado'])
    .withMessage('Estado no válido')
];

// Validaciones para editar curso
exports.validarEdicionCurso = [
  param('id')
    .custom(isValidObjectId).withMessage('ID de curso no válido'),
  
  body('nombre')
    .optional()
    .isLength({ min: 3, max: 100 }).withMessage('El nombre debe tener entre 3 y 100 caracteres')
    .trim(),
  
  body('idioma')
    .optional()
    .isIn(['ingles', 'frances', 'aleman', 'italiano', 'portugues', 'chino', 'japones', 'coreano'])
    .withMessage('Idioma no válido'),
  
  body('nivel')
    .optional()
    .isIn(['A1', 'A2', 'B1', 'B2', 'C1', 'C2'])
    .withMessage('Nivel no válido'),
  
  body('duracionTotal')
    .optional()
    .isInt({ min: 10, max: 500 }).withMessage('La duración debe estar entre 10 y 500 horas'),
  
  body('tarifa')
    .optional()
    .isFloat({ min: 0 }).withMessage('La tarifa no puede ser negativa'),
  
  body('fechaFin')
    .optional()
    .isISO8601().withMessage('Fecha de fin no válida')
];

// Validaciones para inscripción
exports.validarInscripcion = [
  param('id')
    .custom(isValidObjectId).withMessage('ID de curso no válido'),
  
  body('estudianteId')
    .notEmpty().withMessage('El ID del estudiante es obligatorio')
    .custom(isValidObjectId).withMessage('ID de estudiante no válido')
];

// Validaciones para obtener por ID
exports.validarObtenerPorId = [
  param('id')
    .custom(isValidObjectId).withMessage('ID de curso no válido')
];

// Validaciones para filtros de búsqueda
exports.validarFiltrosCursos = [
  query('idioma')
    .optional()
    .isIn(['ingles', 'frances', 'aleman', 'italiano', 'portugues', 'chino', 'japones', 'coreano'])
    .withMessage('Idioma no válido'),
  
  query('nivel')
    .optional()
    .isIn(['A1', 'A2', 'B1', 'B2', 'C1', 'C2'])
    .withMessage('Nivel no válido'),
  
  query('estado')
    .optional()
    .isIn(['planificado', 'activo', 'completado', 'cancelado'])
    .withMessage('Estado no válido'),
  
  query('profesor')
    .optional()
    .custom(isValidObjectId).withMessage('ID de profesor no válido'),
  
  query('page')
    .optional()
    .isInt({ min: 1 }).withMessage('La página debe ser un número positivo'),
  
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 }).withMessage('El límite debe estar entre 1 y 100')
];