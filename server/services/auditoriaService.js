/**
 * Audit Service
 * Business logic for handling audit logs
 * 
 */

const { AuditoriaLog } = require('../models')
const { TIPOS_EVENTO_AUDITORIA } = require('../shared/utils/constants')

/**
 * Register an audit event
 * @param {String} tipo - Type of event (from TIPOS_EVENTO_AUDITORIA)
 * @param {String} usuarioId - ID of the user associated with the event
 * @param {String} descripcion - Descripction of the event
 * @param {Object} detalle - Additional details (optional)
 * @param {Object} req - Express request object (to extract IP and userAgent)
 */
const registrarEvento = async (tipo, usuarioId, descripcion, detalle = {}, req = null) => {
  try {
    const logData = {
      tipo,
      usuario: usuarioId,
      descripcion,
      detalle
    }
    
    // If request object is provided, extract IP and user-agent
    if (req) {
      logData.ip = req.ip || req.connection.remoteAddress
      logData.userAgent = req.get('user-agent')
    }
    
    const log = await AuditoriaLog.create(logData)
    
    console.log(`📝 Auditoría: ${tipo} - ${descripcion}`)
    
    return log
  } catch (error) {
    console.error('Error al registrar evento de auditoría:', error.message)
    // Do not throw error to avoid blocking main flow
    return null
  }
}

/**
 * Obtain paginated audit logs with optional filters
 * @param {Object} filtros - Search filters
 * @param {Number} page - Actual page number
 * @param {Number} limit - Items per page
 */
const obtenerLogs = async (filtros = {}, page = 1, limit = 10) => {
  const query = {}
  
  // Type filter
  if (filtros.tipo) {
    query.tipo = filtros.tipo
  }
  
  // User filter
  if (filtros.usuario) {
    query.usuario = filtros.usuario
  }
  
  // Date range filter
  if (filtros.fechaDesde || filtros.fechaHasta) {
    query.createdAt = {}
    
    if (filtros.fechaDesde) {
      query.createdAt.$gte = new Date(filtros.fechaDesde)
    }
    
    if (filtros.fechaHasta) {
      query.createdAt.$lte = new Date(filtros.fechaHasta)
    }
  }
  
  const skip = (page - 1) * limit
  
  const [logs, total] = await Promise.all([
    AuditoriaLog.find(query)
      .populate('usuario', 'firstName lastName email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    AuditoriaLog.countDocuments(query)
  ])
  
  return {
    logs,
    total,
    page,
    totalPages: Math.ceil(total / limit)
  }
}

/**
 * Obtain recent logs for a specific user
 * @param {String} usuarioId - User ID
 * @param {Number} limit - Amount of logs to retrieve
 */
const obtenerLogsPorUsuario = async (usuarioId, limit = 20) => {
  const logs = await AuditoriaLog.find({ usuario: usuarioId })
    .sort({ createdAt: -1 })
    .limit(limit)
    .lean()
  
  return logs
}

/**
 * Obtain statistics of audit events by type
 */
const obtenerEstadisticasEventos = async () => {
  const estadisticas = await AuditoriaLog.aggregate([
    {
      $group: {
        _id: '$tipo',
        count: { $sum: 1 }
      }
    },
    {
      $sort: { count: -1 }
    }
  ])
  
  return estadisticas
}

module.exports = {
  registrarEvento,
  obtenerLogs,
  obtenerLogsPorUsuario,
  obtenerEstadisticasEventos
}