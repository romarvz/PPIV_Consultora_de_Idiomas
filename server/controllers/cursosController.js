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
    
    const paginacion = req.pagination; // Del middleware
    
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
      estado: 'activo', // Solo mostrar cursos activos públicamente
      search: req.query.search
    };
    
    const resultado = await cursosService.listarCursos(filtros, req.pagination);
    
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
    
    // Solo mostrar si está activo
    if (curso.estado !== 'activo') {
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
    const curso = await cursosService.updateCurso(req.params.id, req.body);
    
    return res.status(200).json({
      success: true,
      message: 'Curso actualizado exitosamente',
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
    const profesorId = req.user._id; // Del middleware de autenticación
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
    const estudianteId = req.user._id;
    const cursos = await cursosService.getCursosByEstudiante(estudianteId);
    
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