import api from './api'

/**
 * API Service para gestión de cobros
 * Conecta con el backend en /api/cobros
 */

const cobroAPI = {
  /**
   * Registrar un nuevo cobro
   * POST /api/cobros
   */
  registrarCobro: async (datosCobro) => {
    try {
      const response = await api.post('/cobros', datosCobro)
      return response.data
    } catch (error) {
      throw error.response?.data || { message: 'Error al registrar cobro' }
    }
  },

  /**
   * Obtener cobros de un estudiante
   * GET /api/cobros/estudiante/:idEstudiante
   */
  obtenerCobrosPorEstudiante: async (estudianteId) => {
    try {
      const response = await api.get(`/cobros/estudiante/${estudianteId}`)
      return response.data
    } catch (error) {
      throw error.response?.data || { message: 'Error al obtener cobros' }
    }
  },

  /**
   * Obtener un cobro por ID
   * GET /api/cobros/:id
   */
  obtenerCobroPorId: async (cobroId) => {
    try {
      const response = await api.get(`/cobros/${cobroId}`)
      return response.data
    } catch (error) {
      throw error.response?.data || { message: 'Error al obtener cobro' }
    }
  },

  /**
   * Obtener cobros por factura
   * GET /api/cobros/factura/:idFactura
   */
  obtenerCobrosPorFactura: async (facturaId) => {
    try {
      const response = await api.get(`/cobros/factura/${facturaId}`)
      return response.data
    } catch (error) {
      throw error.response?.data || { message: 'Error al obtener cobros de factura' }
    }
  },

  /**
   * Anular un cobro
   * PUT /api/cobros/:id/anular
   */
  anularCobro: async (cobroId) => {
    try {
      const response = await api.put(`/cobros/${cobroId}/anular`)
      return response.data
    } catch (error) {
      throw error.response?.data || { message: 'Error al anular cobro' }
    }
  }
}

export default cobroAPI