/**
 * Dashboard Routes
 * Endpoints for consolidated system data
 * 
 */

const express = require('express')
const router = express.Router()
const dashboardController = require('../controllers/dashboardController')
const { authenticateToken, requireRole } = require('../middleware/authMiddlewareNew')

// All routes require authentication
router.use(authenticateToken)

// PUBLIC ROUTES

// GET /api/dashboard/empresa - General info (all roles)
router.get('/empresa', dashboardController.getInfoEmpresa)

// ADMIN ROUTES

// GET /api/dashboard/estadisticas - General statistics
router.get('/estadisticas', requireRole(['admin']), dashboardController.getEstadisticas)

// GET /api/dashboard/kpis - Main KPIs
router.get('/kpis', requireRole(['admin']), dashboardController.getKPIs)

// GET /api/dashboard/actividad-reciente - Last 7 days activity
router.get('/actividad-reciente', requireRole(['admin']), dashboardController.getActividadReciente)

// GET /api/dashboard/graficos - Graph data
router.get('/graficos', requireRole(['admin']), dashboardController.getDatosGraficos)

// PUT /api/dashboard/actualizar-estadisticas - Update statistics (called automatically from other modules)
router.put('/actualizar-estadisticas', requireRole(['admin']), dashboardController.actualizarEstadisticas)

// POST /api/dashboard/invalidar-cache - Invalidate KPI cache
router.post('/invalidar-cache', requireRole(['admin']), dashboardController.invalidarCache)

module.exports = router
