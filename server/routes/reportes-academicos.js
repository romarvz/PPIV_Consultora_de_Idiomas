const express = require('express');
const router = express.Router();
const reportesAcademicosController = require('../controllers/reportesAcademicosController');

const { authenticateToken, requireRole } = require('../middleware/authMiddlewareNew');

/**
 * ROUTES: Academic Reports
 * BASE URL: /api/reportes-academicos
 */

router.use(authenticateToken);

// ============================================
// SECTION 1: GENERATE REPORTS
// ============================================

/**
 * POST /api/reportes-academicos/generar
 * Generates new academic report for student
 * Acceso: Profesor, Admin
 */
router.post('/generar',
    requireRole(['profesor', 'admin']),
    reportesAcademicosController.generarReporte
);

/**
 * POST /api/reportes-academicos/generar-automatico/:cursoId
 * Generates automatic reports for all course students
 * Acceso: Admin
 */
router.post('/generar-automatico/:cursoId',
    requireRole(['admin']),
    reportesAcademicosController.generarReportesAutomaticos
);

// ============================================
// SECTION 2: GET REPORTS
// ============================================

/**
 * GET /api/reportes-academicos/estudiantes-en-riesgo/asistencia
 * Lista global de estudiantes en riesgo por inasistencias
 * Acceso: Admin
 */
router.get(
  '/estudiantes-en-riesgo/asistencia',
  requireRole(['admin']),
  reportesAcademicosController.obtenerEstudiantesEnRiesgoAsistencia
);

/**
 * GET /api/reportes-academicos/:id
 * Gets specific report by ID
 * Acceso: Estudiante (propio), Profesor, Admin
 */
router.get('/:id', reportesAcademicosController.obtenerReportePorId);

/**
 * GET /api/reportes-academicos/estudiante/:estudianteId
 * Gets all student reports
 * Optional query params: ?periodo=2025-Q1&estado=aprobado&cursoId=xxx
 * Acceso: Estudiante (propio), Profesor, Admin
 */
router.get('/estudiante/:estudianteId', reportesAcademicosController.obtenerReportesPorEstudiante);

/**
 * GET /api/reportes-academicos/curso/:cursoId
 * Gets all course reports
 * Optional query params: ?periodo=2025-Q1&estado=aprobado
 * Acceso: Profesor, Admin
 */
router.get('/curso/:cursoId',
    requireRole(['profesor', 'admin']),
    reportesAcademicosController.obtenerReportesPorCurso
);

/**
 * GET /api/reportes-academicos/periodo/:periodo
 * Gets all period reports (e.g. 2025-Q1)
 * Acceso: Admin
 */
router.get('/periodo/:periodo',
    requireRole(['admin']),
    reportesAcademicosController.obtenerReportesPorPeriodo
);

// ============================================
// SECTION 3: UPDATE REPORTS
// ============================================

/**
 * PUT /api/reportes-academicos/:id
 * Updates existing report
 * Acceso: Profesor (del curso), Admin
 */
router.put('/:id',
    requireRole(['profesor', 'admin']),
    reportesAcademicosController.actualizarReporte
);

/**
 * POST /api/reportes-academicos/:id/evaluacion
 * Adds evaluation to report
 * Acceso: Profesor (del curso), Admin
 */
router.post('/:id/evaluacion',
    requireRole(['profesor', 'admin']),
    reportesAcademicosController.agregarEvaluacion
);

// ============================================
// SECTION 4: STATISTICS AND ANALYSIS
// ============================================

/**
 * GET /api/reportes-academicos/estudiante/:estudianteId/estadisticas
 * Gets general student statistics based on all reports
 * Acceso: Estudiante (propio), Profesor, Admin
 */
router.get('/estudiante/:estudianteId/estadisticas',
    reportesAcademicosController.obtenerEstadisticasEstudiante
);

/**
 * GET /api/reportes-academicos/curso/:cursoId/resumen
 * Gets course summary with all students
 * Acceso: Profesor, Admin
 */
router.get('/curso/:cursoId/resumen',
    requireRole(['profesor', 'admin']),
    reportesAcademicosController.obtenerResumenCurso
);

// ============================================
// SECTION 5: EXPORT
// ============================================

/**
 * GET /api/reportes-academicos/:id/exportar-pdf
 * Exports report to PDF
 * Acceso: Estudiante (propio), Profesor, Admin
 */
router.get('/:id/exportar-pdf', reportesAcademicosController.exportarPDF);

/**
 * GET /api/reportes-academicos/:id/exportar-excel
 * Exports report to Excel
 * Acceso: Estudiante (propio), Profesor, Admin
 */
router.get('/:id/exportar-excel', reportesAcademicosController.exportarExcel);

module.exports = router;