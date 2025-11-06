import api from './api'

/**
 * API Service para gestión de facturas
 * Conecta con el backend en /api/facturas
 */

const facturaAPI = {
  /**
   * Crear una factura en estado BORRADOR
   * POST /api/facturas
   */
  crearFactura: async (datosFactura) => {
    try {
      const response = await api.post('/facturas', datosFactura)
      return response.data
    } catch (error) {
      throw error.response?.data || { message: 'Error al crear factura' }
    }
  },

  /**
   * Autorizar una factura (asignar CAE)
   * PUT /api/facturas/:id/autorizar
   */
  autorizarFactura: async (facturaId) => {
    try {
      const response = await api.put(`/facturas/${facturaId}/autorizar`)
      return response.data
    } catch (error) {
      throw error.response?.data || { message: 'Error al autorizar factura' }
    }
  },

  /**
   * Editar una factura en borrador
   * PUT /api/facturas/:id
   */
  editarFactura: async (facturaId, datosActualizados) => {
    try {
      const response = await api.put(`/facturas/${facturaId}`, datosActualizados)
      return response.data
    } catch (error) {
      throw error.response?.data || { message: 'Error al editar factura' }
    }
  },

  /**
   * Eliminar una factura en borrador
   * DELETE /api/facturas/:id
   */
  eliminarFactura: async (facturaId) => {
    try {
      const response = await api.delete(`/facturas/${facturaId}`)
      return response.data
    } catch (error) {
      throw error.response?.data || { message: 'Error al eliminar factura' }
    }
  },

  /**
   * Obtener una factura por ID
   * GET /api/facturas/:id
   */
  obtenerFacturaPorId: async (facturaId) => {
    try {
      const response = await api.get(`/facturas/${facturaId}`)
      return response.data
    } catch (error) {
      throw error.response?.data || { message: 'Error al obtener factura' }
    }
  },

  /**
   * Obtener todas las facturas de un estudiante
   * GET /api/facturas/estudiante/:idEstudiante
   */
  obtenerFacturasPorEstudiante: async (estudianteId) => {
    try {
      const response = await api.get(`/facturas/estudiante/${estudianteId}`)
      return response.data
    } catch (error) {
      throw error.response?.data || { message: 'Error al obtener facturas' }
    }
  },

  /**
   * Obtener deuda total de un estudiante
   * GET /api/facturas/estudiante/:idEstudiante/deuda
   */
  obtenerDeudaEstudiante: async (estudianteId) => {
    try {
      const response = await api.get(`/facturas/estudiante/${estudianteId}/deuda`)
      return response.data
    } catch (error) {
      throw error.response?.data || { message: 'Error al obtener deuda' }
    }
  },

  /**
   * Verificar estado del servicio ARCA
   * GET /api/facturas/arca/estado
   */
  verificarEstadoARCA: async () => {
    try {
      const response = await api.get('/facturas/arca/estado')
      return response.data
    } catch (error) {
      throw error.response?.data || { message: 'Error al verificar estado ARCA' }
    }
  }
}

export default facturaAPI