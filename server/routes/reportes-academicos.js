const express = require('express');
const router = express.Router();
const reportesAcademicosController = require('../controllers/reportesAcademicosController');

const { authenticateToken, requireRole } = require('../middleware/authMiddlewareNew');

/**
 * RUTAS: Reportes Académicos
 * BASE URL: /api/reportes-academicos
 */

router.use(authenticateToken);

// ============================================
// SECCIÓN 1: GENERAR REPORTES
// ============================================

/**
 * POST /api/reportes-academicos/generar
 * Genera un nuevo reporte académico para un estudiante
 * Acceso: Profesor, Admin
 */
router.post('/generar',
    requireRole(['profesor', 'admin']),
    reportesAcademicosController.generarReporte
);

/**
 * POST /api/reportes-academicos/generar-automatico/:cursoId
 * Genera reportes automáticos para todos los estudiantes de un curso
 * Acceso: Admin
 */
router.post('/generar-automatico/:cursoId',
    requireRole(['admin']),
    reportesAcademicosController.generarReportesAutomaticos
);

// ============================================
// SECCIÓN 2: OBTENER REPORTES
// ============================================

/**
 * GET /api/reportes-academicos/:id
 * Obtiene un reporte específico por ID
 * Acceso: Estudiante (propio), Profesor, Admin
 */
router.get('/:id', reportesAcademicosController.obtenerReportePorId);

/**
 * GET /api/reportes-academicos/estudiante/:estudianteId
 * Obtiene todos los reportes de un estudiante
 * Query params opcionales: ?periodo=2025-Q1&estado=aprobado&cursoId=xxx
 * Acceso: Estudiante (propio), Profesor, Admin
 */
router.get('/estudiante/:estudianteId', reportesAcademicosController.obtenerReportesPorEstudiante);

/**
 * GET /api/reportes-academicos/curso/:cursoId
 * Obtiene todos los reportes de un curso
 * Query params opcionales: ?periodo=2025-Q1&estado=aprobado
 * Acceso: Profesor, Admin
 */
router.get('/curso/:cursoId',
    requireRole(['profesor', 'admin']),
    reportesAcademicosController.obtenerReportesPorCurso
);

/**
 * GET /api/reportes-academicos/periodo/:periodo
 * Obtiene todos los reportes de un período (ej: 2025-Q1)
 * Acceso: Admin
 */
router.get('/periodo/:periodo',
    requireRole(['admin']),
    reportesAcademicosController.obtenerReportesPorPeriodo
);

// ============================================
// SECCIÓN 3: ACTUALIZAR REPORTES
// ============================================

/**
 * PUT /api/reportes-academicos/:id
 * Actualiza un reporte existente
 * Acceso: Profesor (del curso), Admin
 */
router.put('/:id',
    requireRole(['profesor', 'admin']),
    reportesAcademicosController.actualizarReporte
);

/**
 * POST /api/reportes-academicos/:id/evaluacion
 * Agrega una evaluación al reporte
 * Acceso: Profesor (del curso), Admin
 */
router.post('/:id/evaluacion',
    requireRole(['profesor', 'admin']),
    reportesAcademicosController.agregarEvaluacion
);

// ============================================
// SECCIÓN 4: ESTADÍSTICAS Y ANÁLISIS
// ============================================

/**
 * GET /api/reportes-academicos/estudiante/:estudianteId/estadisticas
 * Obtiene estadísticas generales del estudiante basadas en todos sus reportes
 * Acceso: Estudiante (propio), Profesor, Admin
 */
router.get('/estudiante/:estudianteId/estadisticas',
    reportesAcademicosController.obtenerEstadisticasEstudiante
);

/**
 * GET /api/reportes-academicos/curso/:cursoId/resumen
 * Obtiene resumen del curso con todos los estudiantes
 * Acceso: Profesor, Admin
 */
router.get('/curso/:cursoId/resumen',
    requireRole(['profesor', 'admin']),
    reportesAcademicosController.obtenerResumenCurso
);

// ============================================
// SECCIÓN 5: EXPORTACIÓN
// ============================================

/**
 * GET /api/reportes-academicos/:id/exportar-pdf
 * Exporta reporte a PDF
 * Acceso: Estudiante (propio), Profesor, Admin
 */
router.get('/:id/exportar-pdf', reportesAcademicosController.exportarPDF);

/**
 * GET /api/reportes-academicos/:id/exportar-excel
 * Exporta reporte a Excel
 * Acceso: Estudiante (propio), Profesor, Admin
 */
router.get('/:id/exportar-excel', reportesAcademicosController.exportarExcel);

module.exports = router;