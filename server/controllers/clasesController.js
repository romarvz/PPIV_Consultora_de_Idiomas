// controllers/clasesController.js
const clasesService = require('../services/clasesService');

/**
 * Listar todas las clases con filtros
 * GET /api/clases
 */
exports.listarClases = async (req, res) => {
  try {
    const filtros = {
      curso: req.query.curso,
      profesor: req.query.profesor,
      estudiante: req.query.estudiante,
      estado: req.query.estado,
      modalidad: req.query.modalidad,
      fechaInicio: req.query.fechaInicio,
      fechaFin: req.query.fechaFin
    };
    
    const resultado = await clasesService.listarClases(filtros, req.pagination || { page: 1, limit: 10 });
    
    return res.status(200).json({
      success: true,
      data: resultado.clases,
      pagination: resultado.pagination
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

/**
 * Obtener clase por ID
 * GET /api/clases/:id
 */
exports.obtenerClasePorId = async (req, res) => {
  try {
    const clase = await clasesService.getClaseById(req.params.id);
    
    return res.status(200).json({
      success: true,
      data: clase
    });
  } catch (error) {
    return res.status(404).json({
      success: false,
      error: error.message
    });
  }
};

/**
 * Crear nueva clase
 * POST /api/clases
 */
exports.crearClase = async (req, res) => {
  try {
    const clase = await clasesService.createClase(req.body);
    
    return res.status(201).json({
      success: true,
      message: 'Clase creada exitosamente',
      data: clase
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

/**
 * Editar clase
 * PUT /api/clases/:id
 */
exports.editarClase = async (req, res) => {
  try {
    const clase = await clasesService.updateClase(req.params.id, req.body);
    
    return res.status(200).json({
      success: true,
      message: 'Clase actualizada exitosamente',
      data: clase
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

/**
 * Cancelar clase
 * DELETE /api/clases/:id
 */
exports.cancelarClase = async (req, res) => {
  try {
    const { motivo } = req.body;
    const clase = await clasesService.cancelarClase(req.params.id, motivo);
    
    return res.status(200).json({
      success: true,
      message: 'Clase cancelada exitosamente',
      data: clase
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

/**
 * Cambiar estado de clase
 * PATCH /api/clases/:id/estado
 */
exports.cambiarEstadoClase = async (req, res) => {
  try {
    const { estado } = req.body;
    
    if (!estado) {
      return res.status(400).json({
        success: false,
        error: 'El estado es obligatorio'
      });
    }
    
    const clase = await clasesService.getClaseById(req.params.id);
    clase.estado = estado;
    await clase.save();
    
    return res.status(200).json({
      success: true,
      message: 'Estado actualizado',
      data: clase
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

/**
 * Registrar asistencia de un estudiante
 * PUT /api/clases/:id/asistencia
 */
exports.registrarAsistencia = async (req, res) => {
  try {
    const { estudiante, presente, minutosTarde, comentarios } = req.body;
    const registradoPor = req.user.id || req.user._id;
    
    const clase = await clasesService.registrarAsistencia(
      req.params.id,
      estudiante,
      presente,
      minutosTarde,
      comentarios,
      registradoPor
    );
    
    return res.status(200).json({
      success: true,
      message: 'Asistencia registrada exitosamente',
      data: clase
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

/**
 * Registrar mi propia asistencia como estudiante
 * POST /api/clases/:id/asistencia/estudiante
 */
exports.registrarMiAsistencia = async (req, res) => {
  try {
    const { presente, minutosTarde, comentarios } = req.body;
    const estudianteId = req.user.id || req.user._id;
    const registradoPor = estudianteId;
    
    // Verificar que el estudiante pertenece a la clase
    const clase = await clasesService.getClaseById(req.params.id);
    const estudianteEnClase = clase.estudiantes.some(
      est => (est._id || est).toString() === estudianteId.toString()
    );
    
    if (!estudianteEnClase) {
      return res.status(403).json({
        success: false,
        error: 'No estás inscrito en esta clase'
      });
    }
    
    // Verificar que la clase no haya pasado hace más de 24 horas
    const ahora = new Date();
    const fechaClase = new Date(clase.fechaHora);
    const horasDesdeClase = (ahora - fechaClase) / (1000 * 60 * 60);
    
    if (horasDesdeClase > 24) {
      return res.status(400).json({
        success: false,
        error: 'Solo puedes registrar asistencia hasta 24 horas después de la clase'
      });
    }
    
    const claseActualizada = await clasesService.registrarAsistencia(
      req.params.id,
      estudianteId,
      presente,
      minutosTarde || 0,
      comentarios || '',
      registradoPor
    );
    
    return res.status(200).json({
      success: true,
      message: 'Tu asistencia ha sido registrada exitosamente',
      data: claseActualizada
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

/**
 * Registrar asistencia múltiple
 * PUT /api/clases/:id/asistencia/multiple
 */
exports.registrarAsistenciaMultiple = async (req, res) => {
  try {
    const { asistencias } = req.body;
    const registradoPor = req.user.id || req.user._id;
    
    const clase = await clasesService.registrarAsistenciaMultiple(
      req.params.id,
      asistencias,
      registradoPor
    );
    
    return res.status(200).json({
      success: true,
      message: 'Asistencia registrada para todos los estudiantes',
      data: clase
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

/**
 * Obtener asistencia de una clase
 * GET /api/clases/:id/asistencia
 */
exports.obtenerAsistenciaClase = async (req, res) => {
  try {
    const clase = await clasesService.getClaseById(req.params.id);
    
    return res.status(200).json({
      success: true,
      data: {
        asistencia: clase.asistencia,
        porcentajeAsistencia: clase.porcentajeAsistencia,
        estudiantesPresentes: clase.estudiantesPresentes
      }
    });
  } catch (error) {
    return res.status(404).json({
      success: false,
      error: error.message
    });
  }
};

/**
 * Obtener estadísticas de asistencia de un estudiante
 * GET /api/clases/asistencia/estudiante/:estudianteId/curso/:cursoId
 */
exports.obtenerEstadisticasAsistencia = async (req, res) => {
  try {
    const { estudianteId, cursoId } = req.params;
    
    // Verificar permisos: solo el estudiante, sus profesores o admin pueden ver
    if (req.user.role === 'estudiante' && (req.user.id || req.user._id).toString() !== estudianteId) {
      return res.status(403).json({
        success: false,
        error: 'No tiene permisos para ver esta información'
      });
    }
    
    const estadisticas = await clasesService.getAsistenciaEstudiante(estudianteId, cursoId);
    
    return res.status(200).json({
      success: true,
      data: estadisticas
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

/**
 * Completar clase
 * PATCH /api/clases/:id/completar
 */
exports.completarClase = async (req, res) => {
  try {
    const clase = await clasesService.completarClase(req.params.id);
    
    return res.status(200).json({
      success: true,
      message: 'Clase completada y progreso actualizado',
      data: clase
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

/**
 * Obtener mis clases como profesor
 * GET /api/clases/profesor/mis-clases
 */
exports.obtenerClasesProfesor = async (req, res) => {
  try {
    const profesorId = req.user.id || req.user._id;
    const filtros = {
      estado: req.query.estado,
      fechaInicio: req.query.fechaInicio,
      fechaFin: req.query.fechaFin
    };
    
    const clases = await clasesService.getClasesByProfesor(profesorId, filtros);
    
    return res.status(200).json({
      success: true,
      data: clases
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

/**
 * Obtener clases de un profesor específico
 * GET /api/clases/profesor/:profesorId/clases
 */
exports.obtenerClasesPorProfesor = async (req, res) => {
  try {
    const filtros = {
      estado: req.query.estado,
      fechaInicio: req.query.fechaInicio,
      fechaFin: req.query.fechaFin
    };
    
    const clases = await clasesService.getClasesByProfesor(req.params.profesorId, filtros);
    
    return res.status(200).json({
      success: true,
      data: clases
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

/**
 * Obtener mis clases como estudiante
 * GET /api/clases/estudiante/mis-clases
 */
exports.obtenerClasesEstudiante = async (req, res) => {
  try {
    const estudianteId = req.user.id || req.user._id;
    const filtros = {
      estado: req.query.estado,
      fechaInicio: req.query.fechaInicio,
      fechaFin: req.query.fechaFin
    };
    
    const clases = await clasesService.getClasesByEstudiante(estudianteId, filtros);
    
    return res.status(200).json({
      success: true,
      data: clases
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

/**
 * Ver mi asistencia como estudiante
 * GET /api/clases/estudiante/mi-asistencia
 */
exports.verMiAsistencia = async (req, res) => {
  try {
    const estudianteId = req.user.id || req.user._id;
    const cursoId = req.query.curso; // Opcional
    
    const estadisticas = await clasesService.getAsistenciaEstudiante(estudianteId, cursoId);
    
    return res.status(200).json({
      success: true,
      data: estadisticas
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

/**
 * Obtener próximas clases del usuario autenticado
 * GET /api/clases/usuario/proximas
 */
exports.obtenerProximasClases = async (req, res) => {
  try {
    const usuarioId = req.user.id || req.user._id;
    const limite = parseInt(req.query.limite) || 10;
    
    const clases = await clasesService.getProximasClases(usuarioId, limite);
    
    return res.status(200).json({
      success: true,
      data: clases
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

/**
 * Obtener mi calendario
 * GET /api/clases/calendario/mi-calendario
 */
exports.obtenerMiCalendario = async (req, res) => {
  try {
    const usuarioId = req.user.id || req.user._id;
    const { fechaInicio, fechaFin } = req.query;
    
    const EventoCalendario = require('../models/EventoCalendario');
    
    let eventos;
    if (fechaInicio && fechaFin) {
      eventos = await EventoCalendario.findByUsuarioEnRango(
        usuarioId,
        new Date(fechaInicio),
        new Date(fechaFin)
      );
    } else {
      // Por defecto, eventos del mes actual
      const inicio = new Date();
      inicio.setDate(1);
      inicio.setHours(0, 0, 0, 0);
      
      const fin = new Date();
      fin.setMonth(fin.getMonth() + 1);
      fin.setDate(0);
      fin.setHours(23, 59, 59, 999);
      
      eventos = await EventoCalendario.findByUsuarioEnRango(usuarioId, inicio, fin);
    }
    
    return res.status(200).json({
      success: true,
      data: eventos
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

/**
 * Obtener calendario de un usuario específico
 * GET /api/clases/calendario/usuario/:usuarioId
 */
exports.obtenerCalendarioUsuario = async (req, res) => {
  try {
    const { usuarioId } = req.params;
    const { fechaInicio, fechaFin } = req.query;
    
    const EventoCalendario = require('../models/EventoCalendario');
    
    const inicio = fechaInicio ? new Date(fechaInicio) : new Date();
    const fin = fechaFin ? new Date(fechaFin) : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    
    const eventos = await EventoCalendario.findByUsuarioEnRango(usuarioId, inicio, fin);
    
    return res.status(200).json({
      success: true,
      data: eventos
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

/**
 * Sincronizar clases con calendario
 * POST /api/clases/calendario/sincronizar
 */
exports.sincronizarCalendario = async (req, res) => {
  try {
    const usuarioId = req.user.id || req.user._id;
    const EventoCalendario = require('../models/EventoCalendario');
    
    const eventosCreados = await EventoCalendario.sincronizarClasesUsuario(usuarioId);
    
    return res.status(200).json({
      success: true,
      message: `${eventosCreados.length} eventos sincronizados`,
      data: eventosCreados
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

/**
 * Obtener estadísticas de clases de un curso
 * GET /api/clases/curso/:cursoId/estadisticas
 */
exports.obtenerEstadisticasCurso = async (req, res) => {
  try {
    const estadisticas = await clasesService.getEstadisticasCurso(req.params.cursoId);
    
    return res.status(200).json({
      success: true,
      data: estadisticas
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

/**
 * Obtener estadísticas generales de clases
 * GET /api/clases/estadisticas/generales
 */
exports.obtenerEstadisticasGenerales = async (req, res) => {
  try {
    const estadisticas = await clasesService.getEstadisticasGenerales();
    
    return res.status(200).json({
      success: true,
      data: estadisticas
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
};