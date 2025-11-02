/**
 * Dashboard Routes
 * Endpoints for consolidated system data
 * 
 */

const express = require('express')
const router = express.Router()
const dashboardController = require('../controllers/dashboardController')
const { authMiddleware, checkRole } = require('../middleware/authMiddlewareNew')

// All routes require authentication
router.use(authMiddleware)

// PUBLIC ROUTES

// GET /api/dashboard/empresa - General info (all roles)
router.get('/empresa', dashboardController.getInfoEmpresa)

// ADMIN ROUTES

// GET /api/dashboard/estadisticas - Estadísticas generales
router.get('/estadisticas', checkRole(['admin']), dashboardController.getEstadisticas)

// GET /api/dashboard/kpis - KPIs principales (CON CACHÉ)
router.get('/kpis', checkRole(['admin']), dashboardController.getKPIs)

// GET /api/dashboard/actividad-reciente - Últimos 7 días (NUEVO - SEMANA 2)
router.get('/actividad-reciente', checkRole(['admin']), dashboardController.getActividadReciente)

// GET /api/dashboard/graficos - Datos para gráficos (NUEVO - SEMANA 2)
router.get('/graficos', checkRole(['admin']), dashboardController.getDatosGraficos)

// PUT /api/dashboard/actualizar-estadisticas - Actualizar stats
router.put('/actualizar-estadisticas', checkRole(['admin']), dashboardController.actualizarEstadisticas)

// POST /api/dashboard/invalidar-cache - Invalidar caché KPIs (NUEVO - SEMANA 2)
router.post('/invalidar-cache', checkRole(['admin']), dashboardController.invalidarCache)

module.exports = router
