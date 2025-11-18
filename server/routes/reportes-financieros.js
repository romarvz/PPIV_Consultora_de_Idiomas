const express = require('express');
const router = express.Router();
const reportesFinancierosController = require('../controllers/reportesFinancierosController');

const { authenticateToken, requireRole } = require('../middleware/authMiddlewareNew');

/**
 * ROUTES: Financial Reports
 * BASE URL: /api/reportes-financieros
 */

router.use(authenticateToken);

// ============================================
// SECTION 1: GENERATE REPORTS
// ============================================

/**
 * POST /api/reportes-financieros/generar
 * Generates new financial report for period
 * Acceso: Admin
 */
router.post('/generar',
    requireRole(['admin']),
    reportesFinancierosController.generarReporte
);

/**
 * POST /api/reportes-financieros/generar-automatico
 * Generates automatic report for current period
 * Acceso: Admin
 */
router.post('/generar-automatico',
    requireRole(['admin']),
    reportesFinancierosController.generarReporteAutomatico
);

// ============================================
// SECTION 2: GET REPORTS
// ============================================

/**
 * GET /api/reportes-financieros/periodo/:periodo
 * Gets specific report by period (e.g. 2025-Q1 or 2025-01)
 * Acceso: Admin
 */
router.get('/periodo/:periodo',
    requireRole(['admin']),
    reportesFinancierosController.obtenerReportePorPeriodo
);

/**
 * GET /api/reportes-financieros/recientes
 * Gets most recent reports
 * Optional query params: ?limite=5
 * Acceso: Admin
 */
router.get('/recientes',
    requireRole(['admin']),
    reportesFinancierosController.obtenerReportesRecientes
);

/**
 * GET /api/reportes-financieros/dashboard/financiero
 * Resumen global para dashboard financiero
 * Acceso: Admin
 */
router.get('/dashboard/financiero',
    requireRole(['admin']),
    reportesFinancierosController.obtenerResumenFinancieroDashboard
);

/**
 * GET /api/reportes-financieros
 * Gets all reports with optional filters
 * Optional query params: ?desde=2025-01-01&hasta=2025-12-31
 * Acceso: Admin
 */
router.get('/',
    requireRole(['admin']),
    reportesFinancierosController.obtenerTodosReportes
);

// ============================================
// SECTION 3: UPDATE REPORTS
// ============================================

/**
 * PUT /api/reportes-financieros/periodo/:periodo
 * Updates existing report
 * Acceso: Admin
 */
router.put('/periodo/:periodo',
    requireRole(['admin']),
    reportesFinancierosController.actualizarReporte
);

/**
 * POST /api/reportes-financieros/periodo/:periodo/deuda
 * Adds student with debt to report
 * Acceso: Admin
 */
router.post('/periodo/:periodo/deuda',
    requireRole(['admin']),
    reportesFinancierosController.agregarEstudianteConDeuda
);

// ============================================
// SECTION 4: ANALYSIS AND COMPARISONS
// ============================================

/**
 * GET /api/reportes-financieros/comparar/:periodo1/:periodo2
 * Compares two financial periods
 * Example: /comparar/2025-Q1/2025-Q2
 * Acceso: Admin
 */
router.get('/comparar/:periodo1/:periodo2',
    requireRole(['admin']),
    reportesFinancierosController.compararPeriodos
);

/**
 * GET /api/reportes-financieros/tendencias
 * Gets financial trends from recent periods
 * Optional query params: ?cantidad=4
 * Acceso: Admin
 */
router.get('/tendencias',
    requireRole(['admin']),
    reportesFinancierosController.obtenerTendencias
);

/**
 * GET /api/reportes-financieros/morosidad
 * Gets delinquency statistics (students with debt)
 * Acceso: Admin
 */
router.get('/morosidad',
    requireRole(['admin']),
    reportesFinancierosController.obtenerEstadisticasMorosidad
);

/**
 * GET /api/reportes-financieros/proyeccion
 * Calculates income projection for next period
 * Acceso: Admin
 */
router.get('/proyeccion',
    requireRole(['admin']),
    reportesFinancierosController.calcularProyeccion
);

// ============================================
// SECTION 5: EXPORT
// ============================================

/**
 * GET /api/reportes-financieros/periodo/:periodo/exportar-pdf
 * Exports financial report to PDF
 * Acceso: Admin
 */
router.get('/periodo/:periodo/exportar-pdf',
    requireRole(['admin']),
    reportesFinancierosController.exportarPDF
);

/**
 * GET /api/reportes-financieros/periodo/:periodo/exportar-excel
 * Exports financial report to Excel
 * Acceso: Admin
 */
router.get('/periodo/:periodo/exportar-excel',
    requireRole(['admin']),
    reportesFinancierosController.exportarExcel
);

module.exports = router;