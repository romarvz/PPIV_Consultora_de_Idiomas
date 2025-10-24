/**
 * Audit Controller
 * Endpoints to manage audit logs
 * 
 */

const auditoriaService = require('../services/auditoriaService')
const { sendSuccess, sendError } = require('../shared/helpers')

/**
 * GET /api/auditoria
 * Obtain paginated audit logs with optional filters
 */
exports.obtenerLogs = async (req, res) => {
  try {
    const { page, limit } = req.pagination
    const filtros = {
      tipo: req.query.tipo,
      usuario: req.query.usuario,
      fechaDesde: req.query.fechaDesde,
      fechaHasta: req.query.fechaHasta
    }
    
    const resultado = await auditoriaService.obtenerLogs(filtros, page, limit)
    
    return sendSuccess(res, resultado, 'Logs obtenidos exitosamente')
  } catch (error) {
    return sendError(res, error)
  }
}

/**
 * GET /api/auditoria/usuario/:usuarioId
 * Obtain recent logs for a specific user
 */
exports.obtenerLogsPorUsuario = async (req, res) => {
  try {
    const { usuarioId } = req.params
    const limit = parseInt(req.query.limit) || 20
    
    const logs = await auditoriaService.obtenerLogsPorUsuario(usuarioId, limit)
    
    return sendSuccess(res, logs, 'Logs del usuario obtenidos')
  } catch (error) {
    return sendError(res, error)
  }
}

/**
 * GET /api/auditoria/estadisticas
 * Obtain statistics of audit events by type
 */
exports.obtenerEstadisticas = async (req, res) => {
  try {
    const estadisticas = await auditoriaService.obtenerEstadisticasEventos()
    
    return sendSuccess(res, estadisticas, 'Estadísticas obtenidas')
  } catch (error) {
    return sendError(res, error)
  }
}