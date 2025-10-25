const express = require('express');
const router = express.Router();
const reportesAcademicosController = require('../controllers/reportesAcademicosController');

/**
 * RUTAS: Reportes Académicos
 * BASE URL: /api/reportes-academicos
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
 * POST /api/reportes-academicos/generar
 * Genera un nuevo reporte académico para un estudiante
 * Acceso: Profesor, Admin
 */
router.post('/generar',
    checkRole(['profesor', 'admin']),
    reportesAcademicosController.generarReporte
);

/**
 * POST /api/reportes-academicos/generar-automatico/:cursoId
 * Genera reportes automáticos para todos los estudiantes de un curso
 * Acceso: Admin
 */
router.post('/generar-automatico/:cursoId',
    checkRole(['admin']),
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
    checkRole(['profesor', 'admin']),
    reportesAcademicosController.obtenerReportesPorCurso
);

/**
 * GET /api/reportes-academicos/periodo/:periodo
 * Obtiene todos los reportes de un período (ej: 2025-Q1)
 * Acceso: Admin
 */
router.get('/periodo/:periodo',
    checkRole(['admin']),
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
    checkRole(['profesor', 'admin']),
    reportesAcademicosController.actualizarReporte
);

/**
 * POST /api/reportes-academicos/:id/evaluacion
 * Agrega una evaluación al reporte
 * Acceso: Profesor (del curso), Admin
 */
router.post('/:id/evaluacion',
    checkRole(['profesor', 'admin']),
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
    checkRole(['profesor', 'admin']),
    reportesAcademicosController.obtenerResumenCurso
);

module.exports = router;