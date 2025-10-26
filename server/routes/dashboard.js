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

// GET /api/dashboard/empresa - General info (all roles)
router.get('/empresa', dashboardController.getInfoEmpresa)

// GET /api/dashboard/estadisticas - Admin only
router.get('/estadisticas', checkRole(['admin']), dashboardController.getEstadisticas)

// GET /api/dashboard/kpis - Admin only
router.get('/kpis', checkRole(['admin']), dashboardController.getKPIs)

// PUT /api/dashboard/actualizar-estadisticas - Admin only
router.put('/actualizar-estadisticas', checkRole(['admin']), dashboardController.actualizarEstadisticas)

module.exports = router
