const { validationResult } = require('express-validator');
const cursosService = require('../services/cursosService');
const { sendSuccess, sendError, sendValidationError } = require('../shared/helpers');

/**
 * Función auxiliar para manejar errores de validación
 */
const handleValidationErrors = (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return sendValidationError(res, errors);
  }
  return null;
};

/**
 * Obtener horarios disponibles de un profesor
 * GET /api/cursos/profesor/:profesorId/horarios-disponibles
 */
exports.getHorariosDisponiblesProfesor = async (req, res) => {
  try {
    const validationError = handleValidationErrors(req, res);
    if (validationError) return validationError;

    const { profesorId } = req.params;

    // Llamar al servicio
    const horariosDisponibles = await cursosService.getHorariosDisponiblesProfesor(profesorId);

    return sendSuccess(
      res,
      { horarios: horariosDisponibles, count: horariosDisponibles.length },
      `Horarios disponibles obtenidos: ${horariosDisponibles.length} encontrados`
    );

  } catch (error) {
    console.error('Error obteniendo horarios disponibles:', error);

    // Si es error de "Profesor no encontrado", retornar 404
    if (error.message.includes('no encontrado')) {
      return sendError(res, error.message, 404);
    }

    // Si es error de "no es un profesor"
    if (error.message.includes('no es un profesor')) {
      return sendError(res, error.message, 400);
    }

    // Error genérico
    return sendError(res, error, 500);
  }
};

/**
 * Verificar si un horario específico está disponible para un profesor
 * GET /api/cursos/profesor/:profesorId/horario/:horarioId/disponible
 */
exports.verificarHorarioDisponible = async (req, res) => {
  try {
    const validationError = handleValidationErrors(req, res);
    if (validationError) return validationError;

    const { profesorId, horarioId } = req.params;

    const estaDisponible = await cursosService.isHorarioDisponibleProfesor(profesorId, horarioId);

    return sendSuccess(
      res,
      { 
        profesorId, 
        horarioId, 
        disponible: estaDisponible 
      },
      `Horario ${estaDisponible ? 'disponible' : 'ocupado'}`
    );

  } catch (error) {
    console.error('Error verificando horario disponible:', error);

    if (error.message.includes('no encontrado')) {
      return sendError(res, error.message, 404);
    }

    return sendError(res, error, 500);
  }
};

/**
 * Obtener resumen de disponibilidad de un profesor
 * GET /api/cursos/profesor/:profesorId/resumen-disponibilidad
 */
exports.getResumenDisponibilidadProfesor = async (req, res) => {
  try {
    const validationError = handleValidationErrors(req, res);
    if (validationError) return validationError;

    const { profesorId } = req.params;

    const resumen = await cursosService.getResumenDisponibilidadProfesor(profesorId);

    return sendSuccess(
      res,
      resumen,
      'Resumen de disponibilidad obtenido exitosamente'
    );

  } catch (error) {
    console.error('Error obteniendo resumen de disponibilidad:', error);

    if (error.message.includes('no encontrado')) {
      return sendError(res, error.message, 404);
    }

    return sendError(res, error, 500);
  }
};