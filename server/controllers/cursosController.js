// controllers/cursosController.js
const cursosService = require('../services/cursosService');

/**
 * Listar todos los cursos con filtros
 * GET /api/cursos
 */
exports.listarCursos = async (req, res) => {
  try {
    const filtros = {
      idioma: req.query.idioma,
      nivel: req.query.nivel,
      estado: req.query.estado,
      profesor: req.query.profesor,
      search: req.query.search
    };
    
    const paginacion = req.pagination || { page: 1, limit: 10 }; // From middleware or default values
    
    const resultado = await cursosService.listarCursos(filtros, paginacion);
    
    return res.status(200).json({
      success: true,
      data: resultado.cursos,
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
 * Listar cursos públicos (sin autenticación)
 * GET /api/cursos/publico
 */
exports.listarCursosPublicos = async (req, res) => {
  try {
    const filtros = {
      idioma: req.query.idioma,
      nivel: req.query.nivel,
      search: req.query.search
    };

    if (req.query.estado) {
      filtros.estado = req.query.estado;
    } else {
      filtros.estado = { $in: ['activo', 'planificado'] };
    }
    
    const resultado = await cursosService.listarCursos(filtros, req.pagination || { page: 1, limit: 10 });
    
    return res.status(200).json({
      success: true,
      data: resultado.cursos,
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
 * Ver detalle de curso público
 * GET /api/cursos/publico/:id
 */
exports.verCursoPublico = async (req, res) => {
  try {
    const curso = await cursosService.getCursoById(req.params.id);
    
    // Only show if active
    if (!['activo', 'planificado'].includes(curso.estado)) {
      return res.status(404).json({
        success: false,
        error: 'Curso no disponible'
      });
    }
    
    return res.status(200).json({
      success: true,
      data: curso
    });
  } catch (error) {
    return res.status(404).json({
      success: false,
      error: error.message
    });
  }
};

/**
 * Obtener curso por ID
 * GET /api/cursos/:id
 */
exports.obtenerCursoPorId = async (req, res) => {
  try {
    const curso = await cursosService.getCursoById(req.params.id);
    
    return res.status(200).json({
      success: true,
      data: curso
    });
  } catch (error) {
    return res.status(404).json({
      success: false,
      error: error.message
    });
  }
};

/**
 * Crear nuevo curso
 * POST /api/cursos
 */
exports.crearCurso = async (req, res) => {
  try {
    const curso = await cursosService.createCurso(req.body);
    
    return res.status(201).json({
      success: true,
      message: 'Curso creado exitosamente',
      data: curso
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

/**
 * Editar curso
 * PUT /api/cursos/:id
 */
exports.editarCurso = async (req, res) => {
  try {
    // Validate that ID exists
    if (!req.params.id) {
      return res.status(400).json({
        success: false,
        error: 'ID de curso requerido'
      });
    }
    
    console.log('Editando curso:', req.params.id);
    console.log('Datos recibidos:', JSON.stringify(req.body, null, 2));
    
    const curso = await cursosService.updateCurso(req.params.id, req.body);
    
    return res.status(200).json({
      success: true,
      message: 'Curso actualizado exitosamente',
      data: curso
    });
  } catch (error) {
    console.error('Error en editarCurso:', error);
    console.error('Stack:', error.stack);
    return res.status(400).json({
      success: false,
      error: error.message || 'Error al actualizar el curso',
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

/**
 * Eliminar curso (soft delete)
 * DELETE /api/cursos/:id
 */
exports.eliminarCurso = async (req, res) => {
  try {
    const curso = await cursosService.deleteCurso(req.params.id);
    
    return res.status(200).json({
      success: true,
      message: 'Curso cancelado exitosamente',
      data: curso
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

/**
 * Cambiar estado del curso
 * PATCH /api/cursos/:id/estado
 */
exports.cambiarEstadoCurso = async (req, res) => {
  try {
    const { estado } = req.body;
    
    if (!estado) {
      return res.status(400).json({
        success: false,
        error: 'El estado es obligatorio'
      });
    }
    
    const curso = await cursosService.cambiarEstadoCurso(req.params.id, estado);
    
    return res.status(200).json({
      success: true,
      message: 'Estado del curso actualizado',
      data: curso
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

/**
 * Inscribir estudiante a curso
 * POST /api/cursos/:id/inscribir
 */
exports.inscribirEstudiante = async (req, res) => {
  try {
    const { estudianteId } = req.body;
    const inscripcion = await cursosService.inscribirEstudiante(req.params.id, estudianteId);
    
    return res.status(201).json({
      success: true,
      message: 'Estudiante inscrito exitosamente',
      data: inscripcion
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

/**
 * Desinscribir estudiante de curso
 * DELETE /api/cursos/:id/estudiantes/:estudianteId
 */
exports.desinscribirEstudiante = async (req, res) => {
  try {
    const { id: cursoId, estudianteId } = req.params;
    const inscripcion = await cursosService.desinscribirEstudiante(cursoId, estudianteId);
    
    return res.status(200).json({
      success: true,
      message: 'Estudiante desinscrito exitosamente',
      data: inscripcion
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

/**
 * Actualizar notas/calificación de una inscripción
 * PATCH /api/cursos/:cursoId/inscripciones/:inscripcionId/notas
 */
exports.actualizarNotasInscripcion = async (req, res) => {
  try {
    const { cursoId, inscripcionId } = req.params;
    const payloadNotas = req.body || {};

    const inscripcion = await cursosService.updateNotasInscripcion(
      cursoId,
      inscripcionId,
      payloadNotas
    );

    return res.status(200).json({
      success: true,
      message: 'Notas de la inscripción actualizadas correctamente',
      data: inscripcion
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

/**
 * Obtener estudiantes de un curso
 * GET /api/cursos/:id/estudiantes
 */
exports.obtenerEstudiantesCurso = async (req, res) => {
  try {
    const estudiantes = await cursosService.getEstudiantesCurso(req.params.id);
    
    return res.status(200).json({
      success: true,
      data: estudiantes
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

/**
 * Obtener cursos del profesor autenticado
 * GET /api/cursos/profesor/mis-cursos
 */
exports.obtenerCursosProfesor = async (req, res) => {
  try {
    const profesorId = req.user.id || req.user._id; // From authentication middleware
    const cursos = await cursosService.getCursosByProfesor(profesorId);
    
    return res.status(200).json({
      success: true,
      data: cursos
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

/**
 * Obtener cursos de un profesor específico
 * GET /api/cursos/profesor/:profesorId
 */
exports.obtenerCursosPorProfesor = async (req, res) => {
  try {
    const cursos = await cursosService.getCursosByProfesor(req.params.profesorId);
    
    return res.status(200).json({
      success: true,
      data: cursos
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

/**
 * Obtener mis cursos como estudiante
 * GET /api/cursos/estudiante/mis-cursos
 */
exports.obtenerMisCursos = async (req, res) => {
  try {
    const estudianteId = req.user._id || req.user.id;
    console.log('obtenerMisCursos - estudianteId:', estudianteId);
    const cursos = await cursosService.getCursosByEstudiante(estudianteId);
    console.log('obtenerMisCursos - cursos encontrados:', cursos.length);
    
    return res.status(200).json({
      success: true,
      data: cursos
    });
  } catch (error) {
    console.error('Error en obtenerMisCursos:', error);
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

/**
 * Obtener cursos disponibles para inscripción
 * GET /api/cursos/estudiante/disponibles
 */
exports.obtenerCursosDisponibles = async (req, res) => {
  try {
    const estudianteId = req.user._id;
    const cursos = await cursosService.getCursosDisponibles(estudianteId);
    
    return res.status(200).json({
      success: true,
      data: cursos
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

/**
 * Obtener estadísticas de un curso
 * GET /api/cursos/:id/estadisticas
 */
exports.obtenerEstadisticasCurso = async (req, res) => {
  try {
    const estadisticas = await cursosService.getEstadisticasCurso(req.params.id);
    
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
 * Obtener estadísticas generales de cursos
 * GET /api/cursos/estadisticas/generales
 */
exports.obtenerEstadisticasGenerales = async (req, res) => {
  try {
    const estadisticas = await cursosService.getEstadisticasGenerales();
    
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

// --- NEW FUNCTION ---
/**
 * Get available schedules for a specific teacher
 * GET /api/cursos/profesor/:profesorId/horarios-disponibles
 * Query params: excludeCursoId (optional) - Course ID to exclude when calculating availability
 */
exports.obtenerHorariosDisponiblesProfesor = async (req, res) => {
  try {
    const { profesorId } = req.params;
    const { excludeCursoId } = req.query; // Get from query string if exists
    
    console.log('obtenerHorariosDisponiblesProfesor - Profesor:', profesorId, 'Excluir curso:', excludeCursoId);
    
    const horarios = await cursosService.getHorariosDisponiblesProfesor(
      profesorId, 
      excludeCursoId || null
    );
    
    return res.status(200).json({
      success: true,
      data: horarios
    });

  } catch (error) {
    // 404 is better if teacher not found, or 500 for general error
    // Service already throws error, so 400 or 404 is appropriate
    return res.status(404).json({
      success: false,
      error: error.message
    });
  }
};

/**
 * Get all available schedules (for form selection)
 * GET /api/cursos/horarios/todos
 */
exports.obtenerTodosLosHorarios = async (req, res) => {
  try {
    const { Horario } = require('../models');
    
    // Sort by day of week (Monday to Sunday) and then by time
    const ordenDias = {
      'lunes': 1,
      'martes': 2,
      'miercoles': 3,
      'jueves': 4,
      'viernes': 5,
      'sabado': 6,
      'domingo': 7
    };
    
    const horarios = await Horario.find();
    
    // Sort manually because MongoDB alphabetical sort doesn't work well for days
    const horariosOrdenados = horarios.sort((a, b) => {
      const diaA = ordenDias[a.dia] || 99;
      const diaB = ordenDias[b.dia] || 99;
      if (diaA !== diaB) return diaA - diaB;
      return a.horaInicio.localeCompare(b.horaInicio);
    });
    
    return res.status(200).json({
      success: true,
      data: horariosOrdenados
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
};
