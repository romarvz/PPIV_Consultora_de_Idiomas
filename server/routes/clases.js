// routes/clases.js
const express = require('express');
const router = express.Router();
const clasesController = require('../controllers/clasesController');
const { authenticateToken, requireRole } = require('../middleware/authMiddlewareNew');
const { paginationMiddleware } = require('../shared/middleware');
const { validationResult } = require('express-validator');
const {
  validarCreacionClase,
  validarEdicionClase,
  validarRegistroAsistencia,
  validarRegistroAsistenciaMultiple,
  validarObtenerPorId,
  validarCancelacion,
  validarFiltrosClases,
  validarCalendario,
  verificarDisponibilidadProfesor
} = require('../validators/clasesValidators');

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
// TODAS LAS RUTAS REQUIEREN AUTENTICACIÓN
// ============================================

router.use(authenticateToken);

// ============================================
// RUTAS PARA TODOS LOS USUARIOS AUTENTICADOS
// ============================================

// Listar clases (con filtros)
router.get(
  '/',
  validarFiltrosClases,
  handleValidationErrors,
  paginationMiddleware,
  clasesController.listarClases
);

// Obtener clase por ID
router.get(
  '/:id',
  validarObtenerPorId,
  handleValidationErrors,
  clasesController.obtenerClasePorId
);

// Obtener próximas clases del usuario autenticado
router.get(
  '/usuario/proximas',
  clasesController.obtenerProximasClases
);

// ============================================
// RUTAS PARA ESTUDIANTES
// ============================================

// Obtener mis clases como estudiante
router.get(
  '/estudiante/mis-clases',
  requireRole(['estudiante']),
  validarFiltrosClases,
  handleValidationErrors,
  paginationMiddleware,
  clasesController.obtenerClasesEstudiante
);

// Ver mi asistencia a clases
router.get(
  '/estudiante/mi-asistencia',
  requireRole(['estudiante']),
  clasesController.verMiAsistencia
);

// ============================================
// RUTAS PARA PROFESORES
// ============================================

// Obtener mis clases como profesor
router.get(
  '/profesor/mis-clases',
  requireRole(['profesor']),
  clasesController.obtenerClasesProfesor
);

// Obtener clases de un profesor específico (admin)
router.get(
  '/profesor/:profesorId/clases',
  requireRole(['admin', 'profesor']),
  validarFiltrosClases,
  handleValidationErrors,
  paginationMiddleware,
  clasesController.obtenerClasesPorProfesor
);

// ============================================
// RUTAS PARA CREAR/EDITAR CLASES
// ============================================

// Crear nueva clase (admin o profesor)
router.post(
  '/',
  requireRole(['admin', 'profesor']),
  validarCreacionClase,
  handleValidationErrors,
  verificarDisponibilidadProfesor,
  clasesController.crearClase
);

// Editar clase
router.put(
  '/:id',
  requireRole(['admin', 'profesor']),
  validarEdicionClase,
  handleValidationErrors,
  verificarDisponibilidadProfesor,
  clasesController.editarClase
);

// Eliminar clase (soft delete / cancelar)
router.delete(
  '/:id',
  requireRole(['admin', 'profesor']),
  validarCancelacion,
  handleValidationErrors,
  clasesController.cancelarClase
);

// ============================================
// RUTAS PARA ASISTENCIA
// ============================================

// Registrar asistencia de un estudiante (profesor del curso o admin)
router.put(
  '/:id/asistencia',
  requireRole(['profesor', 'admin']),
  validarRegistroAsistencia,
  handleValidationErrors,
  clasesController.registrarAsistencia
);

// Registrar mi propia asistencia como estudiante
router.post(
  '/:id/asistencia/estudiante',
  requireRole(['estudiante']),
  validarRegistroAsistencia,
  handleValidationErrors,
  clasesController.registrarMiAsistencia
);

// Registrar asistencia múltiple (toda la clase de una vez)
router.put(
  '/:id/asistencia/multiple',
  requireRole(['profesor', 'admin']),
  validarRegistroAsistenciaMultiple,
  handleValidationErrors,
  clasesController.registrarAsistenciaMultiple
);

// Obtener asistencia de una clase
router.get(
  '/:id/asistencia',
  validarObtenerPorId,
  handleValidationErrors,
  clasesController.obtenerAsistenciaClase
);

// Obtener estadísticas de asistencia de un estudiante en un curso
router.get(
  '/asistencia/estudiante/:estudianteId/curso/:cursoId',
  requireRole(['profesor', 'admin', 'estudiante']),
  clasesController.obtenerEstadisticasAsistencia
);

// ============================================
// RUTAS PARA COMPLETAR/CANCELAR CLASES
// ============================================

// Completar clase (marca como completada y actualiza progreso)
router.patch(
  '/:id/completar',
  requireRole(['profesor', 'admin']),
  validarObtenerPorId,
  handleValidationErrors,
  clasesController.completarClase
);

// Cambiar estado de clase
router.patch(
  '/:id/estado',
  requireRole(['profesor', 'admin']),
  validarObtenerPorId,
  handleValidationErrors,
  clasesController.cambiarEstadoClase
);

// ============================================
// RUTAS PARA CALENDARIO
// ============================================

// Obtener calendario del usuario autenticado
router.get(
  '/calendario/mi-calendario',
  clasesController.obtenerMiCalendario
);

// Obtener calendario de un usuario específico (admin)
router.get(
  '/calendario/usuario/:usuarioId',
  requireRole(['admin']),
  validarCalendario,
  handleValidationErrors,
  clasesController.obtenerCalendarioUsuario
);

// Sincronizar clases con calendario (crea eventos automáticamente)
router.post(
  '/calendario/sincronizar',
  clasesController.sincronizarCalendario
);

// ============================================
// RUTAS PARA ESTADÍSTICAS
// ============================================

// Obtener estadísticas de clases de un curso
router.get(
  '/curso/:cursoId/estadisticas',
  requireRole(['admin', 'profesor']),
  validarObtenerPorId,
  handleValidationErrors,
  clasesController.obtenerEstadisticasCurso
);

// Obtener estadísticas generales de clases
router.get(
  '/estadisticas/generales',
  requireRole(['admin']),
  clasesController.obtenerEstadisticasGenerales
);

module.exports = router;