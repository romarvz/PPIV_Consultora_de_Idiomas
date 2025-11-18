/**
 * Dashboard Controller
 * Endpoints to get consolidated system data
 */

const dashboardService = require('../services/dashboardService')
const { sendSuccess, sendError } = require('../shared/helpers')

/**
 * GET /api/dashboard/empresa
 Get general company */
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
 * Obtain general statistics
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
 * Obtain main KPIs
 */
exports.getKPIs = async (req, res) => {
  try {
    // Use cached KPIs if available
    const kpis = await dashboardService.obtenerKPIsConCache()
    
    return sendSuccess(res, kpis, 'KPIs obtenidos exitosamente')
  } catch (error) {
    return sendError(res, error)
  }
}

/**
 * GET /api/dashboard/actividad-reciente
 * Obtain recent activity
 */
exports.getActividadReciente = async (req, res) => {
  try {
    const actividad = await dashboardService.obtenerActividadReciente()
    
    return sendSuccess(res, actividad, 'Actividad reciente obtenida')
  } catch (error) {
    return sendError(res, error)
  }
}

/**
 * GET /api/dashboard/graficos
 * Obtain data for charts
 * NUEVO - SEMANA 2
 */
exports.getDatosGraficos = async (req, res) => {
  try {
    const datos = await dashboardService.obtenerDatosGraficos()
    
    return sendSuccess(res, datos, 'Datos de gráficos obtenidos')
  } catch (error) {
    return sendError(res, error)
  }
}

/**
 * PUT /api/dashboard/actualizar-estadisticas
 * Update statistics (called automatically from other modules)
 */
exports.actualizarEstadisticas = async (req, res) => {
  try {
    await dashboardService.actualizarEstadisticas()
    
    return sendSuccess(res, null, 'Estadísticas actualizadas', 200)
  } catch (error) {
    return sendError(res, error)
  }
}

/**
 * POST /api/dashboard/invalidar-cache
 * Invalidate KPI cache
 */
exports.invalidarCache = async (req, res) => {
  try {
    dashboardService.invalidarCache()
    
    return sendSuccess(res, null, 'Caché invalidado exitosamente', 200)
  } catch (error) {
    return sendError(res, error)
  }
}
