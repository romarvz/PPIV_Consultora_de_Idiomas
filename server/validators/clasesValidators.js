// validators/clasesValidators.js
const { body, param, query } = require('express-validator');
const mongoose = require('mongoose');
const Clase = require('../models/Clase');

const isValidObjectId = (value) => {
  return mongoose.Types.ObjectId.isValid(value);
};

// Validaciones para crear clase
exports.validarCreacionClase = [
  body('curso')
    .notEmpty().withMessage('El curso es obligatorio')
    .custom(isValidObjectId).withMessage('ID de curso no válido'),
  
  body('titulo')
    .notEmpty().withMessage('El título de la clase es obligatorio')
    .isLength({ min: 3, max: 150 }).withMessage('El título debe tener entre 3 y 150 caracteres')
    .trim(),
  
  body('descripcion')
    .optional()
    .isLength({ max: 1000 }).withMessage('La descripción no puede exceder 1000 caracteres')
    .trim(),
  
  body('profesor')
    .notEmpty().withMessage('El profesor es obligatorio')
    .custom(isValidObjectId).withMessage('ID de profesor no válido'),
  
  body('fechaHora')
    .notEmpty().withMessage('La fecha y hora son obligatorias')
    .isISO8601().withMessage('Fecha y hora no válidas')
    .custom((value) => {
      if (new Date(value) < new Date()) {
        throw new Error('La fecha y hora deben ser futuras');
      }
      return true;
    }),
  
  body('duracionMinutos')
    .notEmpty().withMessage('La duración es obligatoria')
    .isInt({ min: 30, max: 180 }).withMessage('La duración debe estar entre 30 y 180 minutos'),
  
  body('modalidad')
    .notEmpty().withMessage('La modalidad es obligatoria')
    .isIn(['presencial', 'virtual']).withMessage('Modalidad no válida'),
  
  body('aula')
    .if(body('modalidad').equals('presencial'))
    .notEmpty().withMessage('Las clases presenciales requieren un aula')
    .isLength({ max: 50 }).withMessage('El nombre del aula no puede exceder 50 caracteres')
    .trim(),
  
  body('enlaceVirtual')
    .if(body('modalidad').equals('virtual'))
    .notEmpty().withMessage('Las clases virtuales requieren un enlace')
    .isURL().withMessage('El enlace debe ser una URL válida')
    .trim(),
  
  body('estudiantes')
    .optional()
    .isArray().withMessage('Estudiantes debe ser un array')
    .custom((estudiantes) => {
      if (estudiantes && estudiantes.length > 0) {
        return estudiantes.every(id => mongoose.Types.ObjectId.isValid(id));
      }
      return true;
    }).withMessage('Uno o más IDs de estudiantes no son válidos'),
  
  body('contenido')
    .optional()
    .isLength({ max: 2000 }).withMessage('El contenido no puede exceder 2000 caracteres')
    .trim(),
  
  body('tareas')
    .optional()
    .isLength({ max: 1000 }).withMessage('Las tareas no pueden exceder 1000 caracteres')
    .trim()
];

// Middleware personalizado para verificar disponibilidad del profesor
exports.verificarDisponibilidadProfesor = async (req, res, next) => {
  try {
    const { profesor, fechaHora, duracionMinutos, curso } = req.body;
    const claseId = req.params.id; // Si estamos editando
    
    if (!profesor || !fechaHora || !duracionMinutos) {
      return next(); // Los validators base se encargarán de estos errores
    }
    
    let cursoId = curso;
    if (!cursoId && claseId) {
      const claseActual = await Clase.findById(claseId).select('curso');
      if (claseActual) {
        cursoId = claseActual.curso;
      }
    }
    
    const disponible = await Clase.verificarDisponibilidadProfesor(
      profesor,
      new Date(fechaHora),
      duracionMinutos,
      claseId,
      cursoId
    );
    
    if (!disponible) {
      return res.status(409).json({
        success: false,
        error: 'El profesor no está disponible en ese horario. Ya tiene una clase programada.'
      });
    }
    
    next();
  } catch (error) {
    next(error);
  }
};

// Validaciones para editar clase
exports.validarEdicionClase = [
  param('id')
    .custom(isValidObjectId).withMessage('ID de clase no válido'),
  
  body('titulo')
    .optional()
    .isLength({ min: 3, max: 150 }).withMessage('El título debe tener entre 3 y 150 caracteres')
    .trim(),
  
  body('descripcion')
    .optional()
    .isLength({ max: 1000 }).withMessage('La descripción no puede exceder 1000 caracteres')
    .trim(),
  
  body('fechaHora')
    .optional()
    .isISO8601().withMessage('Fecha y hora no válidas'),
  
  body('duracionMinutos')
    .optional()
    .isInt({ min: 30, max: 180 }).withMessage('La duración debe estar entre 30 y 180 minutos'),
  
  body('aula')
    .optional()
    .isLength({ max: 50 }).withMessage('El nombre del aula no puede exceder 50 caracteres')
    .trim(),
  
  body('enlaceVirtual')
    .optional()
    .isURL().withMessage('El enlace debe ser una URL válida')
    .trim(),
  
  body('estado')
    .optional()
    .isIn(['programada', 'en_curso', 'completada', 'cancelada'])
    .withMessage('Estado no válido')
];

// Validaciones para registrar asistencia
exports.validarRegistroAsistencia = [
  param('id')
    .custom(isValidObjectId).withMessage('ID de clase no válido'),
  
  body('estudiante')
    .notEmpty().withMessage('El ID del estudiante es obligatorio')
    .custom(isValidObjectId).withMessage('ID de estudiante no válido'),
  
  body('presente')
    .notEmpty().withMessage('El estado de presencia es obligatorio')
    .isBoolean().withMessage('Presente debe ser true o false'),
  
  body('minutosTarde')
    .optional()
    .isInt({ min: 0 }).withMessage('Los minutos de tardanza no pueden ser negativos'),
  
  body('comentarios')
    .optional()
    .isLength({ max: 200 }).withMessage('Los comentarios no pueden exceder 200 caracteres')
    .trim()
];

// Validaciones para registrar asistencia múltiple
exports.validarRegistroAsistenciaMultiple = [
  param('id')
    .custom(isValidObjectId).withMessage('ID de clase no válido'),
  
  body('asistencias')
    .notEmpty().withMessage('La lista de asistencias es obligatoria')
    .isArray({ min: 1 }).withMessage('Debe haber al menos una asistencia'),
  
  body('asistencias.*.estudiante')
    .custom(isValidObjectId).withMessage('ID de estudiante no válido'),
  
  body('asistencias.*.presente')
    .isBoolean().withMessage('Presente debe ser true o false'),
  
  body('asistencias.*.minutosTarde')
    .optional()
    .isInt({ min: 0 }).withMessage('Los minutos de tardanza no pueden ser negativos')
];

// Validaciones para obtener por ID
exports.validarObtenerPorId = [
  param('id')
    .custom(isValidObjectId).withMessage('ID de clase no válido')
];

// Validaciones para cancelar clase
exports.validarCancelacion = [
  param('id')
    .custom(isValidObjectId).withMessage('ID de clase no válido'),
  
  body('motivo')
    .notEmpty().withMessage('El motivo de cancelación es obligatorio')
    .isLength({ min: 10, max: 300 }).withMessage('El motivo debe tener entre 10 y 300 caracteres')
    .trim()
];

// Validaciones para filtros de búsqueda
exports.validarFiltrosClases = [
  query('curso')
    .optional()
    .custom(isValidObjectId).withMessage('ID de curso no válido'),
  
  query('profesor')
    .optional()
    .custom(isValidObjectId).withMessage('ID de profesor no válido'),
  
  query('estudiante')
    .optional()
    .custom(isValidObjectId).withMessage('ID de estudiante no válido'),
  
  query('estado')
    .optional()
    .isIn(['programada', 'en_curso', 'completada', 'cancelada'])
    .withMessage('Estado no válido'),
  
  query('modalidad')
    .optional()
    .isIn(['presencial', 'virtual'])
    .withMessage('Modalidad no válida'),
  
  query('fechaInicio')
    .optional()
    .isISO8601().withMessage('Fecha de inicio no válida'),
  
  query('fechaFin')
    .optional()
    .isISO8601().withMessage('Fecha de fin no válida'),
  
  query('page')
    .optional()
    .isInt({ min: 1 }).withMessage('La página debe ser un número positivo'),
  
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 }).withMessage('El límite debe estar entre 1 y 100')
];

// Validaciones para calendario
exports.validarCalendario = [
  param('usuarioId')
    .custom(isValidObjectId).withMessage('ID de usuario no válido'),
  
  query('fechaInicio')
    .optional()
    .isISO8601().withMessage('Fecha de inicio no válida'),
  
  query('fechaFin')
    .optional()
    .isISO8601().withMessage('Fecha de fin no válida')
];