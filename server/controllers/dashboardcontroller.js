/**
 * Dashboard Controller
 * Endpoints to get consolidated system data
 * 
 */

const dashboardService = require('../services/dashboardService')
const { sendSuccess, sendError } = require('../shared/helpers')

/**
 * GET /api/dashboard/empresa
 * Get company general information
 */
exports.getInfoEmpresa = async (req, res) => {
  try {
    const empresa = await dashboardService.obtenerInfoEmpresa()
    
    return sendSuccess(res, empresa, 'Información de empresa obtenida')
  } catch (error) {
    return sendError(res, error)
  }
}

/**
 * GET /api/dashboard/estadisticas
 * Get general statistics
 */
exports.getEstadisticas = async (req, res) => {
  try {
    const estadisticas = await dashboardService.obtenerEstadisticasEmpresa()
    
    return sendSuccess(res, estadisticas, 'Estadísticas obtenidas')
  } catch (error) {
    return sendError(res, error)
  }
}

/**
 * GET /api/dashboard/kpis
 * Get main KPIs
 */
exports.getKPIs = async (req, res) => {
  try {
    const kpis = await dashboardService.obtenerKPIs()
    
    return sendSuccess(res, kpis, 'KPIs obtenidos exitosamente')
  } catch (error) {
    return sendError(res, error)
  }
}

/**
 * PUT /api/dashboard/actualizar-estadisticas
 * Update statistics (automatically called from other modules)
 */
exports.actualizarEstadisticas = async (req, res) => {
  try {
    await dashboardService.actualizarEstadisticas()
    
    return sendSuccess(res, null, 'Estadísticas actualizadas', 200)
  } catch (error) {
    return sendError(res, error)
  }
}
