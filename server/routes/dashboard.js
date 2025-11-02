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

// GET /api/dashboard/estadisticas - General statistics
router.get('/estadisticas', checkRole(['admin']), dashboardController.getEstadisticas)

// GET /api/dashboard/kpis - Main KPIs
router.get('/kpis', checkRole(['admin']), dashboardController.getKPIs)

// GET /api/dashboard/actividad-reciente - Last 7 days activity
router.get('/actividad-reciente', checkRole(['admin']), dashboardController.getActividadReciente)

// GET /api/dashboard/graficos - Graph data
router.get('/graficos', checkRole(['admin']), dashboardController.getDatosGraficos)

// PUT /api/dashboard/actualizar-estadisticas - Update statistics (called automatically from other modules)
router.put('/actualizar-estadisticas', checkRole(['admin']), dashboardController.actualizarEstadisticas)

// POST /api/dashboard/invalidar-cache - Invalidate KPI cache
router.post('/invalidar-cache', checkRole(['admin']), dashboardController.invalidarCache)

module.exports = router
