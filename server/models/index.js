// routes/clases.js
const express = require('express');
const router = express.Router();
const clasesController = require('../controllers/clasesController');
const { authMiddleware, checkRole } = require('../middleware/authMiddleware');
const { paginationMiddleware } = require('../shared/middleware/paginationMiddleware');
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

router.use(authMiddleware);

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
  checkRole(['student']),
  validarFiltrosClases,
  handleValidationErrors,
  paginationMiddleware,
  clasesController.obtenerClasesEstudiante
);

// Ver mi asistencia a clases
router.get(
  '/estudiante/mi-asistencia',
  checkRole(['student']),
  clasesController.verMiAsistencia
);

// ============================================
// RUTAS PARA PROFESORES
// ============================================

// Obtener mis clases como profesor
router.get(
  '/profesor/mis-clases',
  checkRole(['teacher']),
  validarFiltrosClases,
  handleValidationErrors,
  paginationMiddleware,
  clasesController.obtenerClasesProfesor
);

// Obtener clases de un profesor específico (admin)
router.get(
  '/profesor/:profesorId/clases',
  checkRole(['admin', 'teacher']),
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
  checkRole(['admin', 'teacher']),
  validarCreacionClase,
  handleValidationErrors,
  verificarDisponibilidadProfesor,
  clasesController.crearClase
);

// Editar clase
router.put(
  '/:id',
  checkRole(['admin', 'teacher']),
  validarEdicionClase,
  handleValidationErrors,
  verificarDisponibilidadProfesor,
  clasesController.editarClase
);

// Eliminar clase (soft delete / cancelar)
router.delete(
  '/:id',
  checkRole(['admin', 'teacher']),
  validarCancelacion,
  handleValidationErrors,
  clasesController.cancelarClase
);

// ============================================
// RUTAS PARA ASISTENCIA
// ============================================

// Registrar asistencia de un estudiante (profesor del curso)
router.put(
  '/:id/asistencia',
  checkRole(['teacher', 'admin']),
  validarRegistroAsistencia,
  handleValidationErrors,
  clasesController.registrarAsistencia
);

// Registrar asistencia múltiple (toda la clase de una vez)
router.put(
  '/:id/asistencia/multiple',
  checkRole(['teacher', 'admin']),
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
  checkRole(['teacher', 'admin', 'student']),
  clasesController.obtenerEstadisticasAsistencia
);

// ============================================
// RUTAS PARA COMPLETAR/CANCELAR CLASES
// ============================================

// Completar clase (marca como completada y actualiza progreso)
router.patch(
  '/:id/completar',
  checkRole(['teacher', 'admin']),
  validarObtenerPorId,
  handleValidationErrors,
  clasesController.completarClase
);

// Cambiar estado de clase
router.patch(
  '/:id/estado',
  checkRole(['teacher', 'admin']),
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
  checkRole(['admin']),
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
  checkRole(['admin', 'teacher']),
  validarObtenerPorId,
  handleValidationErrors,
  clasesController.obtenerEstadisticasCurso
);

// Obtener estadísticas generales de clases
router.get(
  '/estadisticas/generales',
  checkRole(['admin']),
  clasesController.obtenerEstadisticasGenerales
);

module.exports = router;