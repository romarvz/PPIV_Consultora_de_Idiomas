const express = require('express');
const router = express.Router();
const reportesFinancierosController = require('../controllers/reportesFinancierosController');

/**
 * RUTAS: Reportes Financieros
 * BASE URL: /api/reportes-financieros
 * 
 * NOTA: Autenticación comentada por ahora, se activará cuando Romina termine su middleware
 */

// TEMPORARY: Comment out authentication until middleware is ready
// const { authMiddleware } = require('../middleware/authMiddlewareNew');
// router.use(authMiddleware);

// Temporary auth middleware for testing
const tempAuthMiddleware = (req, res, next) => {
    req.user = {
        _id: 'temp-user-id',
        role: 'admin'
    };
    next();
};

const checkRole = (roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                error: 'No autenticado'
            });
        }

        if (!roles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                error: 'No tienes permisos para esta acción'
            });
        }

        next();
    };
};

router.use(tempAuthMiddleware);

// ============================================
// SECCIÓN 1: GENERAR REPORTES
// ============================================

/**
 * POST /api/reportes-financieros/generar
 * Genera un nuevo reporte financiero para un período
 * Acceso: Admin
 */
router.post('/generar',
    checkRole(['admin']),
    reportesFinancierosController.generarReporte
);

/**
 * POST /api/reportes-financieros/generar-automatico
 * Genera reporte automático para el período actual
 * Acceso: Admin
 */
router.post('/generar-automatico',
    checkRole(['admin']),
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
    checkRole(['admin']),
    reportesFinancierosController.obtenerReportePorPeriodo
);

/**
 * GET /api/reportes-financieros/recientes
 * Obtiene los reportes más recientes
 * Query params opcionales: ?limite=5
 * Acceso: Admin
 */
router.get('/recientes',
    checkRole(['admin']),
    reportesFinancierosController.obtenerReportesRecientes
);

/**
 * GET /api/reportes-financieros
 * Obtiene todos los reportes con filtros opcionales
 * Query params opcionales: ?desde=2025-01-01&hasta=2025-12-31
 * Acceso: Admin
 */
router.get('/',
    checkRole(['admin']),
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
    checkRole(['admin']),
    reportesFinancierosController.actualizarReporte
);

/**
 * POST /api/reportes-financieros/periodo/:periodo/deuda
 * Agrega un estudiante con deuda al reporte
 * Acceso: Admin
 */
router.post('/periodo/:periodo/deuda',
    checkRole(['admin']),
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
    checkRole(['admin']),
    reportesFinancierosController.compararPeriodos
);

/**
 * GET /api/reportes-financieros/tendencias
 * Obtiene tendencias financieras de últimos períodos
 * Query params opcionales: ?cantidad=4
 * Acceso: Admin
 */
router.get('/tendencias',
    checkRole(['admin']),
    reportesFinancierosController.obtenerTendencias
);

/**
 * GET /api/reportes-financieros/morosidad
 * Obtiene estadísticas de morosidad (estudiantes con deuda)
 * Acceso: Admin
 */
router.get('/morosidad',
    checkRole(['admin']),
    reportesFinancierosController.obtenerEstadisticasMorosidad
);

/**
 * GET /api/reportes-financieros/proyeccion
 * Calcula proyección de ingresos para próximo período
 * Acceso: Admin
 */
router.get('/proyeccion',
    checkRole(['admin']),
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
    checkRole(['admin']),
    reportesFinancierosController.exportarPDF
);

/**
 * GET /api/reportes-financieros/periodo/:periodo/exportar-excel
 * Exporta reporte financiero a Excel
 * Acceso: Admin
 */
router.get('/periodo/:periodo/exportar-excel',
    checkRole(['admin']),
    reportesFinancierosController.exportarExcel
);

module.exports = router;