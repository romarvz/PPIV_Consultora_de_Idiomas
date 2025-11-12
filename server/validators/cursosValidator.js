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

  body('modalidad')
    .notEmpty().withMessage('La modalidad es obligatoria')
    .isIn(['presencial', 'online']).withMessage('Modalidad no válida'),

  body('type')
    .notEmpty().withMessage('El formato del curso es obligatorio')
    .isIn(['Curso Grupal', 'Clase Individual', 'Curso Corporativo', 'Certificacion', 'Inmersion Cultural', 'Otros'])
    .withMessage('Tipo de curso no válido'),
    
  body('profesor')
    .notEmpty().withMessage('El profesor es obligatorio')
    .custom(isValidObjectId).withMessage('ID de profesor no válido'),

  // --- NUEVA VALIDACIÓN ---
  body('horario')
    .optional()
    .custom((value, { req }) => {
      // Si no hay horario pero tampoco hay horarios, es un error
      if (!value && (!req.body.horarios || req.body.horarios.length === 0)) {
        throw new Error('Debe proporcionar al menos un horario (horario o horarios)');
      }
      // Si hay horario, validar que sea un ObjectId válido
      if (value && !isValidObjectId(value)) {
        throw new Error('ID de horario no válido');
      }
      return true;
    }),
  
  body('horarios')
    .optional()
    .isArray().withMessage('horarios debe ser un array')
    .custom((value) => {
      if (value && value.length > 3) {
        throw new Error('Puede seleccionar máximo 3 horarios por curso');
      }
      if (value && value.length === 0) {
        throw new Error('Si proporciona horarios, debe tener al menos un elemento');
      }
      // Validar que todos los elementos sean ObjectIds válidos
      if (value) {
        for (const horarioId of value) {
          if (!isValidObjectId(horarioId)) {
            throw new Error(`ID de horario no válido: ${horarioId}`);
          }
        }
      }
      return true;
    }),
  // --- FIN NUEVA VALIDACIÓN ---
    
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
    
  // --- NUEVA VALIDACIÓN ---
  body('imageUrl')
    .optional()
    .isURL().withMessage('Debe ser una URL de imagen válida')
    .trim(),
  // --- FIN NUEVA VALIDACIÓN ---

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

  body('modalidad')
    .optional()
    .isIn(['presencial', 'online']).withMessage('Modalidad no válida'),

  body('type')
    .optional()
    .isIn(['Curso Grupal', 'Clase Individual', 'Curso Corporativo', 'Certificacion', 'Inmersion Cultural', 'Otros'])
    .withMessage('Tipo de curso no válido'),

  // --- NUEVA VALIDACIÓN ---
  body('horario')
    .optional()
    .custom((value, { req }) => {
      // Si no hay horario pero tampoco hay horarios, es un error
      if (!value && (!req.body.horarios || req.body.horarios.length === 0)) {
        // Permitir que no haya horario si se está editando y no se está cambiando
        return true; // En edición, puede no estar presente
      }
      // Si hay horario, validar que sea un ObjectId válido
      if (value && !isValidObjectId(value)) {
        throw new Error('ID de horario no válido');
      }
      return true;
    }),
  
  body('horarios')
    .optional()
    .isArray().withMessage('horarios debe ser un array')
    .custom((value) => {
      if (value && value.length > 3) {
        throw new Error('Puede seleccionar máximo 3 horarios por curso');
      }
      if (value && value.length === 0) {
        throw new Error('Si proporciona horarios, debe tener al menos un elemento');
      }
      // Validar que todos los elementos sean ObjectIds válidos
      if (value) {
        for (const horarioId of value) {
          if (!isValidObjectId(horarioId)) {
            throw new Error(`ID de horario no válido: ${horarioId}`);
          }
        }
      }
      return true;
    }),
  // --- FIN NUEVA VALIDACIÓN ---

  // --- NUEVA VALIDACIÓN ---
  body('imageUrl')
    .optional()
    .isURL().withMessage('Debe ser una URL de imagen válida')
    .trim(),
  // --- FIN NUEVA VALIDACIÓN ---
    
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