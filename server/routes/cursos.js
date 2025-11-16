// routes/cursos.js
const express = require('express');
const router = express.Router();
const cursosController = require('../controllers/cursosController');
const { authenticateToken, requireRole } = require('../middleware/authMiddlewareNew');
const { paginationMiddleware } = require('../shared/middleware');
const { validationResult } = require('express-validator');
const {
  validarCreacionCurso,
  validarEdicionCurso,
  validarInscripcion,
  validarObtenerPorId,
  validarFiltrosCursos
} = require('../validators/cursosValidator');

// Middleware to handle validation errors
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.error('❌ Errores de validación:', errors.array());
    return res.status(400).json({
      success: false,
      errors: errors.array(),
      message: errors.array().map(e => e.msg).join(', ')
    });
  }
  next();
};

// ============================================
// PUBLIC ROUTES (no authentication required)
// ============================================

// List available courses (public)
router.get(
  '/publico',
  validarFiltrosCursos,
  handleValidationErrors,
  paginationMiddleware,
  cursosController.listarCursosPublicos
);

// View course details (public)
router.get(
  '/publico/:id',
  validarObtenerPorId,
  handleValidationErrors,
  cursosController.verCursoPublico
);

// ============================================
// PROTECTED ROUTES (authentication required)
// ============================================

router.use(authenticateToken); // All following routes require authentication

// ============================================
// ROUTES FOR ALL AUTHENTICATED USERS
// ============================================

// List courses (with filters)
router.get(
  '/',
  validarFiltrosCursos,
  handleValidationErrors,
  paginationMiddleware,
  cursosController.listarCursos
);

// Get course by ID
router.get(
  '/:id',
  validarObtenerPorId,
  handleValidationErrors,
  cursosController.obtenerCursoPorId
);

// Get students from a course
router.get(
  '/:id/estudiantes',
  validarObtenerPorId,
  handleValidationErrors,
  cursosController.obtenerEstudiantesCurso
);

// ============================================
// ROUTES FOR STUDENTS
// ============================================

// View my courses (as student)
router.get(
  '/estudiante/mis-cursos',
  requireRole(['estudiante']),
  paginationMiddleware,
  cursosController.obtenerMisCursos
);

// View available courses for enrollment
router.get(
  '/estudiante/disponibles',
  requireRole(['estudiante']),
  validarFiltrosCursos,
  handleValidationErrors,
  paginationMiddleware,
  cursosController.obtenerCursosDisponibles
);

// ============================================
// ROUTES FOR TEACHERS
// ============================================

// Get courses of authenticated teacher
router.get(
  '/profesor/mis-cursos',
  requireRole(['profesor']),
  cursosController.obtenerCursosProfesor
);

// Get courses of a specific teacher (admin/teacher)
router.get(
  '/profesor/:profesorId',
  requireRole(['admin', 'profesor']),
  validarObtenerPorId,
  handleValidationErrors,
  paginationMiddleware,
  cursosController.obtenerCursosPorProfesor
);

// ============================================
// ROUTES FOR ADMIN AND TEACHERS
// ============================================

// Create new course
router.post(
  '/',
  requireRole(['admin', 'profesor']),
  validarCreacionCurso,
  handleValidationErrors,
  cursosController.crearCurso
);

// Edit course
router.put(
  '/:id',
  requireRole(['admin', 'profesor']),
  validarEdicionCurso,
  handleValidationErrors,
  cursosController.editarCurso
);

// Change course status
router.patch(
  '/:id/estado',
  requireRole(['admin', 'profesor']),
  validarObtenerPorId,
  handleValidationErrors,
  cursosController.cambiarEstadoCurso
);

// Update enrollment notes (academic sheet) for a course
router.patch(
  '/:cursoId/inscripciones/:inscripcionId/notas',
  requireRole(['admin', 'profesor']),
  cursosController.actualizarNotasInscripcion
);

// ============================================
// ROUTES FOR ADMIN
// ============================================

// Delete course (soft delete)
router.delete(
  '/:id',
  requireRole(['admin']),
  validarObtenerPorId,
  handleValidationErrors,
  cursosController.eliminarCurso
);

// Enroll student to course (admin or course teacher)
router.post(
  '/:id/inscribir',
  requireRole(['admin', 'profesor']),
  validarInscripcion,
  handleValidationErrors,
  cursosController.inscribirEstudiante
);

// Unenroll student from course
router.delete(
  '/:id/estudiantes/:estudianteId',
  requireRole(['admin', 'profesor']),
  validarObtenerPorId,
  handleValidationErrors,
  cursosController.desinscribirEstudiante
);

// Get statistics of a course
router.get(
  '/:id/estadisticas',
  requireRole(['admin', 'profesor']),
  validarObtenerPorId,
  handleValidationErrors,
  cursosController.obtenerEstadisticasCurso
);

// Get general course statistics
router.get(
  '/estadisticas/generales',
  requireRole(['admin']),
  cursosController.obtenerEstadisticasGenerales
);

// Get available schedules of a teacher
router.get(
  '/profesor/:profesorId/horarios-disponibles',
  requireRole(['admin', 'profesor']),
  cursosController.obtenerHorariosDisponiblesProfesor
);

// Get all available schedules (for form selection)
router.get(
  '/horarios/todos',
  requireRole(['admin']),
  cursosController.obtenerTodosLosHorarios
);

module.exports = router;