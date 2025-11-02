const express = require('express');
const router = express.Router();
const { param } = require('express-validator');
const mongoose = require('mongoose');

// Importar controladores
const {
  getHorariosDisponiblesProfesor,
  verificarHorarioDisponible,
  getResumenDisponibilidadProfesor
} = require('../controllers/cursoController');

// Importar middlewares de autenticación
const { authenticateToken, requireAdmin } = require('../middleware/authMiddlewareNew');

// ==================== VALIDADORES ====================

/**
 * Validador para IDs de MongoDB
 */
const validateMongoId = (paramName) => [
  param(paramName)
    .custom(value => {
      if (!mongoose.Types.ObjectId.isValid(value)) {
        throw new Error(`${paramName} debe ser un ID de MongoDB válido`);
      }
      return true;
    })
];

// ==================== RUTAS DE HORARIOS DISPONIBLES ====================

/**
 * Obtener horarios disponibles de un profesor
 * GET /api/cursos/profesor/:profesorId/horarios-disponibles
 * 
 * Retorna array de horarios que el profesor tiene asignados pero no ocupados
 * Usado en frontend para crear/editar cursos
 */
router.get(
  '/profesor/:profesorId/horarios-disponibles',
  authenticateToken,
  requireAdmin, // Solo admins pueden gestionar cursos
  validateMongoId('profesorId'),
  getHorariosDisponiblesProfesor
);

/**
 * Verificar si un horario específico está disponible para un profesor
 * GET /api/cursos/profesor/:profesorId/horario/:horarioId/disponible
 * 
 * Retorna boolean indicando si el horario está libre u ocupado
 */
router.get(
  '/profesor/:profesorId/horario/:horarioId/disponible',
  authenticateToken,
  requireAdmin,
  validateMongoId('profesorId'),
  validateMongoId('horarioId'),
  verificarHorarioDisponible
);

/**
 * Obtener resumen completo de disponibilidad de un profesor
 * GET /api/cursos/profesor/:profesorId/resumen-disponibilidad
 * 
 * Retorna estadísticas detalladas: total, disponibles, ocupados, por día, etc.
 */
router.get(
  '/profesor/:profesorId/resumen-disponibilidad',
  authenticateToken,
  requireAdmin,
  validateMongoId('profesorId'),
  getResumenDisponibilidadProfesor
);

// ==================== RUTA DE PRUEBA ====================

/**
 * Ruta de prueba para verificar que las rutas de cursos funcionan
 * GET /api/cursos/test
 */
router.get('/test', (req, res) => {
  res.json({
    success: true,
    message: 'Rutas de cursos funcionando correctamente',
    timestamp: new Date().toISOString(),
    endpoints: {
      'GET /api/cursos/test': 'Ruta de prueba',
      'GET /api/cursos/profesor/:profesorId/horarios-disponibles': 'Obtener horarios disponibles',
      'GET /api/cursos/profesor/:profesorId/horario/:horarioId/disponible': 'Verificar horario específico',
      'GET /api/cursos/profesor/:profesorId/resumen-disponibilidad': 'Resumen de disponibilidad'
    }
  });
});

// ==================== MIDDLEWARE DE MANEJO DE ERRORES ====================

// Middleware para rutas no encontradas (específico de cursos)
router.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `Ruta ${req.originalUrl} no encontrada en el módulo de cursos`,
    availableRoutes: [
      'GET /api/cursos/test',
      'GET /api/cursos/profesor/:profesorId/horarios-disponibles',
      'GET /api/cursos/profesor/:profesorId/horario/:horarioId/disponible',
      'GET /api/cursos/profesor/:profesorId/resumen-disponibilidad'
    ],
    timestamp: new Date().toISOString()
  });
});

module.exports = router;