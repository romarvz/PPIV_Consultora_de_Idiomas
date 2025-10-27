/**
 * Audit Router
 * Endpoints to manage audit logs
 * 
 */

const express = require('express')
const router = express.Router()
const auditoriaController = require('../controllers/auditoriaController')
const { authMiddleware, checkRole } = require('../middleware/authMiddlewareNew')
const { paginationMiddleware } = require('../shared/middleware')

// All routes below require authentication and admin role
router.use(authMiddleware)
router.use(checkRole(['admin']))

// GET /api/auditoria - Obtain logs with pagination and filters
router.get('/', paginationMiddleware, auditoriaController.obtenerLogs)

// GET /api/auditoria/usuario/:usuarioId - User-specific logs
router.get('/usuario/:usuarioId', auditoriaController.obtenerLogsPorUsuario)

// GET /api/auditoria/estadisticas - Event statistics
router.get('/estadisticas', auditoriaController.obtenerEstadisticas)

module.exports = router