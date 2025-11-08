const express = require('express');
const router = express.Router();
const reportesFinancierosController = require('../controllers/reportesFinancierosController');

const { authenticateToken, requireRole } = require('../middleware/authMiddlewareNew');

/**
 * RUTAS: Reportes Financieros
 * BASE URL: /api/reportes-financieros
 */

router.use(authenticateToken);

// ============================================
// SECCIÓN 1: GENERAR REPORTES
// ============================================

/**
 * POST /api/reportes-financieros/generar
 * Genera un nuevo reporte financiero para un período
 * Acceso: Admin
 */
router.post('/generar',
    requireRole(['admin']),
    reportesFinancierosController.generarReporte
);

/**
 * POST /api/reportes-financieros/generar-automatico
 * Genera reporte automático para el período actual
 * Acceso: Admin
 */
router.post('/generar-automatico',
    requireRole(['admin']),
    reportesFinancierosController.generarReporteAutomatico
);

// ============================================
// SECCIÓN 2: OBTENER REPORTES
// ============================================

/**
 * GET /api/reportes-financieros/periodo/:periodo
 * Obtiene un reporte específico por período (ej: 2025-Q1 o 2025-01)
 * Acceso: Admin
 */
router.get('/periodo/:periodo',
    requireRole(['admin']),
    reportesFinancierosController.obtenerReportePorPeriodo
);

/**
 * GET /api/reportes-financieros/recientes
 * Obtiene los reportes más recientes
 * Query params opcionales: ?limite=5
 * Acceso: Admin
 */
router.get('/recientes',
    requireRole(['admin']),
    reportesFinancierosController.obtenerReportesRecientes
);

/**
 * GET /api/reportes-financieros
 * Obtiene todos los reportes con filtros opcionales
 * Query params opcionales: ?desde=2025-01-01&hasta=2025-12-31
 * Acceso: Admin
 */
router.get('/',
    requireRole(['admin']),
    reportesFinancierosController.obtenerTodosReportes
);

// ============================================
// SECCIÓN 3: ACTUALIZAR REPORTES
// ============================================

/**
 * PUT /api/reportes-financieros/periodo/:periodo
 * Actualiza un reporte existente
 * Acceso: Admin
 */
router.put('/periodo/:periodo',
    requireRole(['admin']),
    reportesFinancierosController.actualizarReporte
);

/**
 * POST /api/reportes-financieros/periodo/:periodo/deuda
 * Agrega un estudiante con deuda al reporte
 * Acceso: Admin
 */
router.post('/periodo/:periodo/deuda',
    requireRole(['admin']),
    reportesFinancierosController.agregarEstudianteConDeuda
);

// ============================================
// SECCIÓN 4: ANÁLISIS Y COMPARACIONES
// ============================================

/**
 * GET /api/reportes-financieros/comparar/:periodo1/:periodo2
 * Compara dos períodos financieros
 * Ejemplo: /comparar/2025-Q1/2025-Q2
 * Acceso: Admin
 */
router.get('/comparar/:periodo1/:periodo2',
    requireRole(['admin']),
    reportesFinancierosController.compararPeriodos
);

/**
 * GET /api/reportes-financieros/tendencias
 * Obtiene tendencias financieras de últimos períodos
 * Query params opcionales: ?cantidad=4
 * Acceso: Admin
 */
router.get('/tendencias',
    requireRole(['admin']),
    reportesFinancierosController.obtenerTendencias
);

/**
 * GET /api/reportes-financieros/morosidad
 * Obtiene estadísticas de morosidad (estudiantes con deuda)
 * Acceso: Admin
 */
router.get('/morosidad',
    requireRole(['admin']),
    reportesFinancierosController.obtenerEstadisticasMorosidad
);

/**
 * GET /api/reportes-financieros/proyeccion
 * Calcula proyección de ingresos para próximo período
 * Acceso: Admin
 */
router.get('/proyeccion',
    requireRole(['admin']),
    reportesFinancierosController.calcularProyeccion
);

// ============================================
// SECCIÓN 5: EXPORTACIÓN
// ============================================

/**
 * GET /api/reportes-financieros/periodo/:periodo/exportar-pdf
 * Exporta reporte financiero a PDF
 * Acceso: Admin
 */
router.get('/periodo/:periodo/exportar-pdf',
    requireRole(['admin']),
    reportesFinancierosController.exportarPDF
);

/**
 * GET /api/reportes-financieros/periodo/:periodo/exportar-excel
 * Exporta reporte financiero a Excel
 * Acceso: Admin
 */
router.get('/periodo/:periodo/exportar-excel',
    requireRole(['admin']),
    reportesFinancierosController.exportarExcel
);

module.exports = router;