// routes/cursos.js
const express = require('express');
const router = express.Router();
const cursosController = require('../controllers/cursosController');
const { authMiddleware, checkRole } = require('../middleware/authMiddleware');
const { paginationMiddleware } = require('../shared/middleware/paginationMiddleware');
const { validationResult } = require('express-validator');
const {
  validarCreacionCurso,
  validarEdicionCurso,
  validarInscripcion,
  validarObtenerPorId,
  validarFiltrosCursos
} = require('../validators/cursosValidators');

// Middleware para manejar errores de validación
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array()
    });
  }
  next();
};

// ============================================
// RUTAS PÚBLICAS (sin autenticación)
// ============================================

// Listar cursos disponibles (público)
router.get(
  '/publico',
  validarFiltrosCursos,
  handleValidationErrors,
  paginationMiddleware,
  cursosController.listarCursosPublicos
);

// Ver detalle de curso (público)
router.get(
  '/publico/:id',
  validarObtenerPorId,
  handleValidationErrors,
  cursosController.verCursoPublico
);

// ============================================
// RUTAS PROTEGIDAS (requieren autenticación)
// ============================================

router.use(authMiddleware); // Todas las siguientes requieren estar autenticado

// ============================================
// RUTAS PARA TODOS LOS USUARIOS AUTENTICADOS
// ============================================

// Listar cursos (con filtros)
router.get(
  '/',
  validarFiltrosCursos,
  handleValidationErrors,
  paginationMiddleware,
  cursosController.listarCursos
);

// Obtener curso por ID
router.get(
  '/:id',
  validarObtenerPorId,
  handleValidationErrors,
  cursosController.obtenerCursoPorId
);

// Obtener estudiantes de un curso
router.get(
  '/:id/estudiantes',
  validarObtenerPorId,
  handleValidationErrors,
  cursosController.obtenerEstudiantesCurso
);

// ============================================
// RUTAS PARA ESTUDIANTES
// ============================================

// Ver mis cursos (como estudiante)
router.get(
  '/estudiante/mis-cursos',
  checkRole(['student']),
  paginationMiddleware,
  cursosController.obtenerMisCursos
);

// Ver cursos disponibles para inscribirse
router.get(
  '/estudiante/disponibles',
  checkRole(['student']),
  validarFiltrosCursos,
  handleValidationErrors,
  paginationMiddleware,
  cursosController.obtenerCursosDisponibles
);

// ============================================
// RUTAS PARA PROFESORES
// ============================================

// Obtener cursos del profesor autenticado
router.get(
  '/profesor/mis-cursos',
  checkRole(['teacher']),
  paginationMiddleware,
  cursosController.obtenerCursosProfesor
);

// Obtener cursos de un profesor específico (admin/profesor)
router.get(
  '/profesor/:profesorId',
  checkRole(['admin', 'teacher']),
  validarObtenerPorId,
  handleValidationErrors,
  paginationMiddleware,
  cursosController.obtenerCursosPorProfesor
);

// ============================================
// RUTAS PARA ADMIN Y PROFESORES
// ============================================

// Crear nuevo curso
router.post(
  '/',
  checkRole(['admin', 'teacher']),
  validarCreacionCurso,
  handleValidationErrors,
  cursosController.crearCurso
);

// Editar curso
router.put(
  '/:id',
  checkRole(['admin', 'teacher']),
  validarEdicionCurso,
  handleValidationErrors,
  cursosController.editarCurso
);

// Cambiar estado del curso
router.patch(
  '/:id/estado',
  checkRole(['admin', 'teacher']),
  validarObtenerPorId,
  handleValidationErrors,
  cursosController.cambiarEstadoCurso
);

// ============================================
// RUTAS PARA ADMIN
// ============================================

// Eliminar curso (soft delete)
router.delete(
  '/:id',
  checkRole(['admin']),
  validarObtenerPorId,
  handleValidationErrors,
  cursosController.eliminarCurso
);

// Inscribir estudiante a curso (admin o profesor del curso)
router.post(
  '/:id/inscribir',
  checkRole(['admin', 'teacher']),
  validarInscripcion,
  handleValidationErrors,
  cursosController.inscribirEstudiante
);

// Desinscribir estudiante de curso
router.delete(
  '/:id/estudiantes/:estudianteId',
  checkRole(['admin', 'teacher']),
  validarObtenerPorId,
  handleValidationErrors,
  cursosController.desinscribirEstudiante
);

// Obtener estadísticas de un curso
router.get(
  '/:id/estadisticas',
  checkRole(['admin', 'teacher']),
  validarObtenerPorId,
  handleValidationErrors,
  cursosController.obtenerEstadisticasCurso
);

// Obtener estadísticas generales de cursos
router.get(
  '/estadisticas/generales',
  checkRole(['admin']),
  cursosController.obtenerEstadisticasGenerales
);

module.exports = router;