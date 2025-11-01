const { body, param, query } = require('express-validator');
const { DIAS_SEMANA, TIPOS_HORARIO } = require('../shared/utils/constants');
const mongoose = require('mongoose');

// Regex para validar formato de hora HH:mm
const HORA_REGEX = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;

/**
 * Validaciones para crear horario
 */
const validateCrearHorario = [
  body('dia')
    .notEmpty()
    .withMessage('Día es requerido')
    .isIn(Object.values(DIAS_SEMANA))
    .withMessage(`Día debe ser uno de: ${Object.values(DIAS_SEMANA).join(', ')}`),
    
  body('horaInicio')
    .notEmpty()
    .withMessage('Hora de inicio es requerida')
    .matches(HORA_REGEX)
    .withMessage('Hora de inicio debe tener formato HH:mm (ej: 09:30)'),
    
  body('horaFin')
    .notEmpty()
    .withMessage('Hora de fin es requerida')
    .matches(HORA_REGEX)
    .withMessage('Hora de fin debe tener formato HH:mm (ej: 11:30)'),
    
  body('tipo')
    .optional()
    .isIn(Object.values(TIPOS_HORARIO))
    .withMessage(`Tipo debe ser uno de: ${Object.values(TIPOS_HORARIO).join(', ')}`),

  // Validación personalizada para verificar que horaFin > horaInicio
  body('horaFin').custom((horaFin, { req }) => {
    const horaInicio = req.body.horaInicio;
    
    if (!horaInicio || !horaFin) {
      return true; // Deja que otras validaciones manejen campos vacíos
    }

    // Convertir a minutos para comparar
    const inicioMinutos = horaAMinutos(horaInicio);
    const finMinutos = horaAMinutos(horaFin);
    
    if (finMinutos <= inicioMinutos) {
      throw new Error('La hora de fin debe ser posterior a la hora de inicio');
    }
    
    return true;
  })
];

/**
 * Validaciones para actualizar horario
 */
const validateActualizarHorario = [
  param('id')
    .notEmpty()
    .withMessage('ID del horario es requerido')
    .custom((id) => {
      if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new Error('ID del horario no es válido');
      }
      return true;
    }),
    
  body('dia')
    .optional()
    .isIn(Object.values(DIAS_SEMANA))
    .withMessage(`Día debe ser uno de: ${Object.values(DIAS_SEMANA).join(', ')}`),
    
  body('horaInicio')
    .optional()
    .matches(HORA_REGEX)
    .withMessage('Hora de inicio debe tener formato HH:mm (ej: 09:30)'),
    
  body('horaFin')
    .optional()
    .matches(HORA_REGEX)
    .withMessage('Hora de fin debe tener formato HH:mm (ej: 11:30)'),
    
  body('tipo')
    .optional()
    .isIn(Object.values(TIPOS_HORARIO))
    .withMessage(`Tipo debe ser uno de: ${Object.values(TIPOS_HORARIO).join(', ')}`),

  // Validación condicional para horas
  body().custom((body) => {
    const { horaInicio, horaFin } = body;
    
    // Solo validar si ambas horas están presentes
    if (horaInicio && horaFin) {
      const inicioMinutos = horaAMinutos(horaInicio);
      const finMinutos = horaAMinutos(horaFin);
      
      if (finMinutos <= inicioMinutos) {
        throw new Error('La hora de fin debe ser posterior a la hora de inicio');
      }
    }
    
    return true;
  })
];

/**
 * Validaciones para obtener horario por ID
 */
const validateHorarioId = [
  param('id')
    .notEmpty()
    .withMessage('ID del horario es requerido')
    .custom((id) => {
      if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new Error('ID del horario no es válido');
      }
      return true;
    })
];

/**
 * Validaciones para obtener horarios por día
 */
const validateHorariosPorDia = [
  param('dia')
    .notEmpty()
    .withMessage('Día es requerido')
    .isIn(Object.values(DIAS_SEMANA))
    .withMessage(`Día debe ser uno de: ${Object.values(DIAS_SEMANA).join(', ')}`)
];

/**
 * Validaciones para verificar disponibilidad
 */
const validateVerificarDisponibilidad = [
  body('dia')
    .notEmpty()
    .withMessage('Día es requerido')
    .isIn(Object.values(DIAS_SEMANA))
    .withMessage(`Día debe ser uno de: ${Object.values(DIAS_SEMANA).join(', ')}`),
    
  body('horaInicio')
    .notEmpty()
    .withMessage('Hora de inicio es requerida')
    .matches(HORA_REGEX)
    .withMessage('Hora de inicio debe tener formato HH:mm (ej: 09:30)'),
    
  body('horaFin')
    .notEmpty()
    .withMessage('Hora de fin es requerida')
    .matches(HORA_REGEX)
    .withMessage('Hora de fin debe tener formato HH:mm (ej: 11:30)'),
    
  body('excluirId')
    .optional()
    .custom((id) => {
      if (id && !mongoose.Types.ObjectId.isValid(id)) {
        throw new Error('ID a excluir no es válido');
      }
      return true;
    }),

  // Validación de lógica temporal
  body('horaFin').custom((horaFin, { req }) => {
    const horaInicio = req.body.horaInicio;
    
    if (!horaInicio || !horaFin) {
      return true;
    }

    const inicioMinutos = horaAMinutos(horaInicio);
    const finMinutos = horaAMinutos(horaFin);
    
    if (finMinutos <= inicioMinutos) {
      throw new Error('La hora de fin debe ser posterior a la hora de inicio');
    }
    
    return true;
  })
];

/**
 * Validaciones para asignar horario a profesor
 */
const validateAsignarHorario = [
  body('horarioId')
    .notEmpty()
    .withMessage('ID del horario es requerido')
    .custom((id) => {
      if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new Error('ID del horario no es válido');
      }
      return true;
    }),
    
  body('profesorId')
    .notEmpty()
    .withMessage('ID del profesor es requerido')
    .custom((id) => {
      if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new Error('ID del profesor no es válido');
      }
      return true;
    })
];

/**
 * Validaciones para obtener horarios de profesor
 */
const validateHorariosProfesor = [
  param('profesorId')
    .notEmpty()
    .withMessage('ID del profesor es requerido')
    .custom((id) => {
      if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new Error('ID del profesor no es válido');
      }
      return true;
    })
];

/**
 * Validaciones para paginación (opcional, complementa paginationMiddleware)
 */
const validatePaginacion = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Página debe ser un número entero mayor a 0'),
    
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Límite debe ser un número entre 1 y 100')
];

/**
 * Validaciones para filtros de búsqueda
 */
const validateFiltrosBusqueda = [
  query('dia')
    .optional()
    .isIn(Object.values(DIAS_SEMANA))
    .withMessage(`Día debe ser uno de: ${Object.values(DIAS_SEMANA).join(', ')}`),
    
  query('tipo')
    .optional()
    .isIn(Object.values(TIPOS_HORARIO))
    .withMessage(`Tipo debe ser uno de: ${Object.values(TIPOS_HORARIO).join(', ')}`),
    
  query('horaDesde')
    .optional()
    .matches(HORA_REGEX)
    .withMessage('horaDesde debe tener formato HH:mm'),
    
  query('horaHasta')
    .optional()
    .matches(HORA_REGEX)
    .withMessage('horaHasta debe tener formato HH:mm')
];

// Función auxiliar para convertir hora a minutos
function horaAMinutos(hora) {
  const [horas, minutos] = hora.split(':').map(Number);
  return horas * 60 + minutos;
}

module.exports = {
  validateCrearHorario,
  validateActualizarHorario,
  validateHorarioId,
  validateHorariosPorDia,
  validateVerificarDisponibilidad,
  validateAsignarHorario,
  validateHorariosProfesor,
  validatePaginacion,
  validateFiltrosBusqueda
};