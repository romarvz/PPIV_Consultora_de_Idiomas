const { validationResult } = require('express-validator');
const { Horario } = require('../models');
const { BaseUser, Profesor } = require('../models');
const { sendSuccess, sendError, sendValidationError, sendPaginated } = require('../shared/helpers');
const { TIPOS_EVENTO_AUDITORIA } = require('../shared/utils/constants');

// Importar servicio de auditoría si está disponible
let auditoriaService;
try {
  auditoriaService = require('../services/auditoriaService');
} catch (error) {
  console.log('Servicio de auditoría no disponible');
}

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
 * Función auxiliar para registrar evento de auditoría
 */
const registrarAuditoria = async (req, tipo, descripcion, detalle = null) => {
  if (auditoriaService && req.user) {
    try {
      await auditoriaService.registrarEvento(
        tipo,
        req.user.id,
        descripcion,
        detalle,
        req.ip,
        req.get('User-Agent')
      );
    } catch (error) {
      console.log('Error registrando auditoría:', error.message);
    }
  }
};

/**
 * Crear nuevo horario
 * POST /api/horarios
 */
const crearHorario = async (req, res) => {
  try {
    const validationError = handleValidationErrors(req, res);
    if (validationError) return validationError;

    const { dia, horaInicio, horaFin, tipo = 'clase' } = req.body;

    // Crear horario
    const nuevoHorario = new Horario({
      dia,
      horaInicio,
      horaFin,
      tipo
    });

    await nuevoHorario.save();

    // Registrar auditoría
    await registrarAuditoria(
      req,
      TIPOS_EVENTO_AUDITORIA.HORARIO_CREADO,
      `Horario creado: ${nuevoHorario.display}`,
      { horarioId: nuevoHorario._id }
    );

    return sendSuccess(
      res,
      { horario: nuevoHorario.toJSON() },
      'Horario creado exitosamente',
      201
    );

  } catch (error) {
    console.error('Error creando horario:', error);

    // Manejar errores específicos de Mongoose
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(err => ({
        field: err.path,
        message: err.message
      }));
      return sendValidationError(res, validationErrors);
    }

    if (error.code === 11000) {
      return sendError(res, 'Ya existe un horario con estos datos', 409);
    }

    return sendError(res, error.message, 500);
  }
};

/**
 * Obtener todos los horarios con paginación y filtros
 * GET /api/horarios
 */
const obtenerHorarios = async (req, res) => {
  try {
    const { page, limit, skip } = req.pagination;
    const { dia, tipo, horaDesde, horaHasta } = req.query;

    // Construir filtros
    const filtros = {};
    
    if (dia) filtros.dia = dia;
    if (tipo) filtros.tipo = tipo;

    // Filtros por rango de horas (si se implementa lógica compleja)
    if (horaDesde || horaHasta) {
      // Nota: Esto requeriría lógica adicional para comparar strings de hora
      // Por simplicidad, lo dejamos como mejora futura
    }

    // Obtener horarios
    const horarios = await Horario.find(filtros)
      .sort({ dia: 1, horaInicio: 1 })
      .limit(limit)
      .skip(skip);

    // Contar total
    const total = await Horario.countDocuments(filtros);

    // Convertir a formato JSON
    const horariosJSON = horarios.map(horario => horario.toJSON());

    return sendPaginated(res, horariosJSON, page, limit, total);

  } catch (error) {
    console.error('Error obteniendo horarios:', error);
    return sendError(res, error.message, 500);
  }
};

/**
 * Obtener horario por ID
 * GET /api/horarios/:id
 */
const obtenerHorarioPorId = async (req, res) => {
  try {
    const validationError = handleValidationErrors(req, res);
    if (validationError) return validationError;

    const { id } = req.params;

    const horario = await Horario.findById(id);

    if (!horario) {
      return sendError(res, 'Horario no encontrado', 404);
    }

    return sendSuccess(res, { horario: horario.toJSON() });

  } catch (error) {
    console.error('Error obteniendo horario:', error);
    return sendError(res, error.message, 500);
  }
};

/**
 * Actualizar horario
 * PUT /api/horarios/:id
 */
const actualizarHorario = async (req, res) => {
  try {
    const validationError = handleValidationErrors(req, res);
    if (validationError) return validationError;

    const { id } = req.params;
    const { dia, horaInicio, horaFin, tipo } = req.body;

    const horario = await Horario.findById(id);

    if (!horario) {
      return sendError(res, 'Horario no encontrado', 404);
    }

    // Guardar valores originales para auditoría
    const valoresOriginales = {
      dia: horario.dia,
      horaInicio: horario.horaInicio,
      horaFin: horario.horaFin,
      tipo: horario.tipo
    };

    // Actualizar campos
    if (dia !== undefined) horario.dia = dia;
    if (horaInicio !== undefined) horario.horaInicio = horaInicio;
    if (horaFin !== undefined) horario.horaFin = horaFin;
    if (tipo !== undefined) horario.tipo = tipo;

    await horario.save();

    // Registrar auditoría
    await registrarAuditoria(
      req,
      TIPOS_EVENTO_AUDITORIA.HORARIO_MODIFICADO,
      `Horario actualizado: ${horario.display}`,
      { 
        horarioId: horario._id,
        valoresOriginales,
        valoresNuevos: {
          dia: horario.dia,
          horaInicio: horario.horaInicio,
          horaFin: horario.horaFin,
          tipo: horario.tipo
        }
      }
    );

    return sendSuccess(
      res,
      { horario: horario.toJSON() },
      'Horario actualizado exitosamente'
    );

  } catch (error) {
    console.error('Error actualizando horario:', error);

    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(err => ({
        field: err.path,
        message: err.message
      }));
      return sendValidationError(res, validationErrors);
    }

    if (error.code === 11000) {
      return sendError(res, 'Ya existe un horario con estos datos', 409);
    }

    return sendError(res, error.message, 500);
  }
};

/**
 * Eliminar horario
 * DELETE /api/horarios/:id
 */
const eliminarHorario = async (req, res) => {
  try {
    const validationError = handleValidationErrors(req, res);
    if (validationError) return validationError;

    const { id } = req.params;

    const horario = await Horario.findById(id);

    if (!horario) {
      return sendError(res, 'Horario no encontrado', 404);
    }

    // Verificar si el horario está asignado a algún profesor
    const profesoresConHorario = await Profesor.find({ horariosPermitidos: id });

    if (profesoresConHorario.length > 0) {
      // Remover referencias antes de eliminar
      await Profesor.updateMany(
        { horariosPermitidos: id },
        { $pull: { horariosPermitidos: id } }
      );
    }

    const horarioData = horario.toJSON();
    await Horario.findByIdAndDelete(id);

    // Registrar auditoría
    await registrarAuditoria(
      req,
      TIPOS_EVENTO_AUDITORIA.HORARIO_ELIMINADO,
      `Horario eliminado: ${horario.display}`,
      { 
        horarioId: id,
        horarioData,
        profesoresAfectados: profesoresConHorario.length
      }
    );

    return sendSuccess(
      res,
      { 
        horario: horarioData,
        profesoresAfectados: profesoresConHorario.length
      },
      'Horario eliminado exitosamente'
    );

  } catch (error) {
    console.error('Error eliminando horario:', error);
    return sendError(res, error.message, 500);
  }
};

/**
 * Obtener horarios por día
 * GET /api/horarios/dia/:dia
 */
const obtenerHorariosPorDia = async (req, res) => {
  try {
    const validationError = handleValidationErrors(req, res);
    if (validationError) return validationError;

    const { dia } = req.params;
    const { page, limit, skip } = req.pagination;

    const horarios = await Horario.find({ dia })
      .sort({ horaInicio: 1 })
      .limit(limit)
      .skip(skip);

    const total = await Horario.countDocuments({ dia });

    const horariosJSON = horarios.map(horario => horario.toJSON());

    return sendPaginated(res, horariosJSON, page, limit, total);

  } catch (error) {
    console.error('Error obteniendo horarios por día:', error);
    return sendError(res, error.message, 500);
  }
};

/**
 * Verificar disponibilidad de horario
 * POST /api/horarios/verificar
 */
const verificarDisponibilidad = async (req, res) => {
  try {
    const validationError = handleValidationErrors(req, res);
    if (validationError) return validationError;

    const { dia, horaInicio, horaFin, excluirId } = req.body;

    const disponibilidad = await Horario.verificarDisponibilidad(dia, horaInicio, horaFin, excluirId);

    return sendSuccess(res, disponibilidad);

  } catch (error) {
    console.error('Error verificando disponibilidad:', error);
    return sendError(res, error.message, 500);
  }
};

/**
 * Asignar horario a profesor
 * POST /api/horarios/asignar
 */
const asignarHorarioAProfesor = async (req, res) => {
  try {
    const validationError = handleValidationErrors(req, res);
    if (validationError) return validationError;

    const { horarioId, profesorId } = req.body;

    // Verificar que el horario existe
    const horario = await Horario.findById(horarioId);
    if (!horario) {
      return sendError(res, 'Horario no encontrado', 404);
    }

    // Verificar que el profesor existe
    const profesor = await Profesor.findById(profesorId);
    if (!profesor) {
      return sendError(res, 'Profesor no encontrado', 404);
    }

    // Verificar que el horario no esté ya asignado
    if (profesor.horariosPermitidos.includes(horarioId)) {
      return sendError(res, 'El horario ya está asignado a este profesor', 409);
    }

    // Asignar horario
    profesor.horariosPermitidos.push(horarioId);
    await profesor.save();

    // Registrar auditoría
    await registrarAuditoria(
      req,
      TIPOS_EVENTO_AUDITORIA.HORARIO_ASIGNADO,
      `Horario asignado: ${horario.display} a ${profesor.fullName}`,
      {
        horarioId: horario._id,
        profesorId: profesor._id,
        horarioData: horario.display
      }
    );

    return sendSuccess(
      res,
      {
        horario: horario.toJSON(),
        profesor: {
          _id: profesor._id,
          fullName: profesor.fullName,
          email: profesor.email
        }
      },
      'Horario asignado exitosamente'
    );

  } catch (error) {
    console.error('Error asignando horario:', error);
    return sendError(res, error.message, 500);
  }
};

/**
 * Obtener horarios de un profesor
 * GET /api/horarios/profesor/:profesorId
 */
const obtenerHorariosProfesor = async (req, res) => {
  try {
    const validationError = handleValidationErrors(req, res);
    if (validationError) return validationError;

    const { profesorId } = req.params;
    const { page, limit, skip } = req.pagination;

    // Verificar que el profesor existe
    const profesor = await Profesor.findById(profesorId).populate('horariosPermitidos');

    if (!profesor) {
      return sendError(res, 'Profesor no encontrado', 404);
    }

    // Aplicar paginación manual a los horarios
    const horariosPermitidos = profesor.horariosPermitidos || [];
    const total = horariosPermitidos.length;
    const horariosPaginados = horariosPermitidos
      .sort((a, b) => {
        // Ordenar por día y hora
        if (a.dia === b.dia) {
          return a.horaInicio.localeCompare(b.horaInicio);
        }
        const diasOrden = ['lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado', 'domingo'];
        return diasOrden.indexOf(a.dia) - diasOrden.indexOf(b.dia);
      })
      .slice(skip, skip + limit);

    const horariosJSON = horariosPaginados.map(horario => horario.toJSON());

    return sendPaginated(res, horariosJSON, page, limit, total);

  } catch (error) {
    console.error('Error obteniendo horarios del profesor:', error);
    return sendError(res, error.message, 500);
  }
};

/**
 * Remover horario de profesor
 * DELETE /api/horarios/profesor/:profesorId/horario/:horarioId
 */
const removerHorarioDeProfesor = async (req, res) => {
  try {
    const { profesorId, horarioId } = req.params;

    // Verificar que el profesor existe
    const profesor = await Profesor.findById(profesorId);
    if (!profesor) {
      return sendError(res, 'Profesor no encontrado', 404);
    }

    // Verificar que el horario existe
    const horario = await Horario.findById(horarioId);
    if (!horario) {
      return sendError(res, 'Horario no encontrado', 404);
    }

    // Remover horario
    profesor.horariosPermitidos = profesor.horariosPermitidos.filter(
      id => id.toString() !== horarioId
    );
    
    await profesor.save();

    // Registrar auditoría
    await registrarAuditoria(
      req,
      TIPOS_EVENTO_AUDITORIA.HORARIO_MODIFICADO,
      `Horario removido: ${horario.display} de ${profesor.fullName}`,
      {
        horarioId: horario._id,
        profesorId: profesor._id,
        accion: 'remover'
      }
    );

    return sendSuccess(
      res,
      {
        horario: horario.toJSON(),
        profesor: {
          _id: profesor._id,
          fullName: profesor.fullName,
          email: profesor.email
        }
      },
      'Horario removido del profesor exitosamente'
    );

  } catch (error) {
    console.error('Error removiendo horario del profesor:', error);
    return sendError(res, error.message, 500);
  }
};

module.exports = {
  crearHorario,
  obtenerHorarios,
  obtenerHorarioPorId,
  actualizarHorario,
  eliminarHorario,
  obtenerHorariosPorDia,
  verificarDisponibilidad,
  asignarHorarioAProfesor,
  obtenerHorariosProfesor,
  removerHorarioDeProfesor
};