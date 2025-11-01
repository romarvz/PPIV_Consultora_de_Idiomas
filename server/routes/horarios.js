const express = require('express');
const router = express.Router();

// Importar controladores
const {
  crearHorario,
  obtenerHorarios,
  obtenerHorarioPorId,
  actualizarHorario,
  eliminarHorario,
  obtenerHorariosPorDia,
  verificarDisponibilidad,
  asignarHorarioAProfesor,
  obtenerHorariosProfesor,
  removerHorarioDeProfesor
} = require('../controllers/horarioController');

// Importar middlewares
const { paginationMiddleware } = require('../shared/middleware');

// Importar middlewares de autenticación (ajustar según tu sistema)
let authenticateToken, requireAdmin, requireRole;
try {
  const authMiddleware = require('../middleware/authMiddlewareNew');
  authenticateToken = authMiddleware.authenticateToken;
  requireAdmin = authMiddleware.requireAdmin;
  requireRole = authMiddleware.requireRole;
} catch (error) {
  // Fallback si no existe authMiddlewareNew
  try {
    const authMiddleware = require('../middleware/authMiddleware');
    authenticateToken = authMiddleware.authenticateToken;
    requireAdmin = authMiddleware.requireAdmin;
    requireRole = authMiddleware.requireRole;
  } catch (error2) {
    console.log('⚠️  Middleware de autenticación no encontrado');
    // Middleware dummy para desarrollo
    authenticateToken = (req, res, next) => {
      req.user = { id: 'dummy-user', role: 'admin' };
      next();
    };
    requireAdmin = (req, res, next) => next();
    requireRole = (roles) => (req, res, next) => next();
  }
}

// Importar validadores
const {
  validateCrearHorario,
  validateActualizarHorario,
  validateHorarioId,
  validateHorariosPorDia,
  validateVerificarDisponibilidad,
  validateAsignarHorario,
  validateHorariosProfesor,
  validatePaginacion,
  validateFiltrosBusqueda
} = require('../validators/horarioValidators');

// ==================== RUTAS DE PRUEBA ====================

/**
 * Ruta de prueba para verificar que las rutas de horarios funcionan
 * GET /api/horarios/test
 */
router.get('/test', (req, res) => {
  res.json({
    success: true,
    message: 'Rutas de horarios funcionando correctamente',
    timestamp: new Date().toISOString(),
    endpoints: {
      'GET /api/horarios': 'Obtener todos los horarios (con paginación)',
      'POST /api/horarios': 'Crear nuevo horario',
      'GET /api/horarios/:id': 'Obtener horario por ID',
      'PUT /api/horarios/:id': 'Actualizar horario',
      'DELETE /api/horarios/:id': 'Eliminar horario',
      'GET /api/horarios/dia/:dia': 'Obtener horarios por día',
      'POST /api/horarios/verificar': 'Verificar disponibilidad',
      'POST /api/horarios/asignar': 'Asignar horario a profesor',
      'GET /api/horarios/profesor/:profesorId': 'Obtener horarios de profesor',
      'DELETE /api/horarios/profesor/:profesorId/horario/:horarioId': 'Remover horario de profesor'
    }
  });
});

// ==================== RUTAS CRUD BÁSICAS ====================

/**
 * Obtener todos los horarios con paginación y filtros
 * GET /api/horarios
 * Query params: page, limit, dia, tipo, horaDesde, horaHasta
 */
router.get('/',
  authenticateToken,
  paginationMiddleware,
  validatePaginacion,
  validateFiltrosBusqueda,
  obtenerHorarios
);

/**
 * Crear nuevo horario
 * POST /api/horarios
 * Body: { dia, horaInicio, horaFin, tipo? }
 * Permisos: Admin o Profesor
 */
router.post('/',
  authenticateToken,
  requireRole(['admin', 'profesor']),
  validateCrearHorario,
  crearHorario
);

/**
 * Obtener horario por ID
 * GET /api/horarios/:id
 */
router.get('/:id',
  authenticateToken,
  validateHorarioId,
  obtenerHorarioPorId
);

/**
 * Actualizar horario
 * PUT /api/horarios/:id
 * Body: { dia?, horaInicio?, horaFin?, tipo? }
 * Permisos: Admin o Profesor (propietario)
 */
router.put('/:id',
  authenticateToken,
  requireRole(['admin', 'profesor']),
  validateActualizarHorario,
  actualizarHorario
);

/**
 * Eliminar horario
 * DELETE /api/horarios/:id
 * Permisos: Solo Admin
 */
router.delete('/:id',
  authenticateToken,
  requireAdmin,
  validateHorarioId,
  eliminarHorario
);

// ==================== RUTAS ESPECÍFICAS ====================

/**
 * Obtener horarios por día de la semana
 * GET /api/horarios/dia/:dia
 * Params: dia (lunes, martes, etc.)
 * Query params: page, limit
 */
router.get('/dia/:dia',
  authenticateToken,
  paginationMiddleware,
  validateHorariosPorDia,
  validatePaginacion,
  obtenerHorariosPorDia
);

/**
 * Verificar disponibilidad de un horario
 * POST /api/horarios/verificar
 * Body: { dia, horaInicio, horaFin, excluirId? }
 */
router.post('/verificar',
  authenticateToken,
  validateVerificarDisponibilidad,
  verificarDisponibilidad
);

// ==================== RUTAS DE GESTIÓN PROFESOR-HORARIO ====================

/**
 * Asignar horario a profesor
 * POST /api/horarios/asignar
 * Body: { horarioId, profesorId }
 * Permisos: Solo Admin
 */
router.post('/asignar',
  authenticateToken,
  requireAdmin,
  validateAsignarHorario,
  asignarHorarioAProfesor
);

/**
 * Obtener horarios asignados a un profesor
 * GET /api/horarios/profesor/:profesorId
 * Query params: page, limit
 */
router.get('/profesor/:profesorId',
  authenticateToken,
  paginationMiddleware,
  validateHorariosProfesor,
  validatePaginacion,
  obtenerHorariosProfesor
);

/**
 * Remover horario específico de un profesor
 * DELETE /api/horarios/profesor/:profesorId/horario/:horarioId
 * Permisos: Admin o el mismo profesor
 */
router.delete('/profesor/:profesorId/horario/:horarioId',
  authenticateToken,
  // Middleware personalizado para verificar permisos
  (req, res, next) => {
    const { profesorId } = req.params;
    const { user } = req;
    
    // Admin puede hacer todo
    if (user.role === 'admin') {
      return next();
    }
    
    // Profesor solo puede modificar sus propios horarios
    if (user.role === 'profesor' && user.id === profesorId) {
      return next();
    }
    
    return res.status(403).json({
      success: false,
      error: 'No tienes permisos para realizar esta acción',
      timestamp: new Date().toISOString()
    });
  },
  removerHorarioDeProfesor
);

// ==================== RUTAS DE CONSULTAS AVANZADAS ====================

/**
 * Obtener estadísticas de horarios
 * GET /api/horarios/stats/general
 * Permisos: Solo Admin
 */
router.get('/stats/general',
  authenticateToken,
  requireAdmin,
  async (req, res) => {
    try {
      const { Horario } = require('../models');
      
      // Estadísticas básicas
      const totalHorarios = await Horario.countDocuments();
      const horariosPorDia = await Horario.aggregate([
        { $group: { _id: '$dia', count: { $sum: 1 } } },
        { $sort: { _id: 1 } }
      ]);
      
      const horariosPorTipo = await Horario.aggregate([
        { $group: { _id: '$tipo', count: { $sum: 1 } } }
      ]);

      return res.json({
        success: true,
        data: {
          totalHorarios,
          horariosPorDia,
          horariosPorTipo
        },
        timestamp: new Date().toISOString()
      });
      
    } catch (error) {
      console.error('Error obteniendo estadísticas:', error);
      return res.status(500).json({
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      });
    }
  }
);

/**
 * Buscar horarios disponibles en un rango
 * POST /api/horarios/buscar-disponibles
 * Body: { horaInicio, horaFin, dias? }
 */
router.post('/buscar-disponibles',
  authenticateToken,
  async (req, res) => {
    try {
      const { horaInicio, horaFin, dias } = req.body;
      const { Horario } = require('../models');
      
      // Validar formato de horas
      const horaRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
      if (!horaRegex.test(horaInicio) || !horaRegex.test(horaFin)) {
        return res.status(400).json({
          success: false,
          error: 'Formato de hora inválido. Use HH:mm',
          timestamp: new Date().toISOString()
        });
      }

      // Filtros base
      let filtros = {};
      if (dias && Array.isArray(dias)) {
        filtros.dia = { $in: dias };
      }

      // Obtener horarios en el rango (lógica simplificada)
      const horariosEnRango = await Horario.getPorRangoHorario(horaInicio, horaFin);
      
      return res.json({
        success: true,
        data: {
          horariosDisponibles: horariosEnRango.map(h => h.toJSON()),
          criterios: { horaInicio, horaFin, dias }
        },
        timestamp: new Date().toISOString()
      });
      
    } catch (error) {
      console.error('Error buscando horarios disponibles:', error);
      return res.status(500).json({
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      });
    }
  }
);

// ==================== MIDDLEWARE DE MANEJO DE ERRORES ====================

// Middleware para rutas no encontradas (específico de horarios)
router.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: `Ruta ${req.originalUrl} no encontrada en el módulo de horarios`,
    availableRoutes: [
      'GET /api/horarios',
      'POST /api/horarios', 
      'GET /api/horarios/:id',
      'PUT /api/horarios/:id',
      'DELETE /api/horarios/:id',
      'GET /api/horarios/dia/:dia',
      'POST /api/horarios/verificar',
      'POST /api/horarios/asignar',
      'GET /api/horarios/profesor/:profesorId'
    ],
    timestamp: new Date().toISOString()
  });
});

module.exports = router;