import api from './api';

const facturaService = {
  // Crear factura (en borrador)
  crearFactura: async (facturaData) => {
    const response = await api.post('/facturas', facturaData);
    return response.data;
  },

  // Listar facturas
  listarFacturas: async (filtros = {}) => {
    const response = await api.get('/facturas', { params: filtros });
    return response.data;
  },

  // Obtener factura por ID
  obtenerFactura: async (id) => {
    const response = await api.get(`/facturas/${id}`);
    return response.data;
  },

  // Autorizar factura (solicitar CAE/CAEA)
  autorizarFactura: async (id) => {
    const response = await api.put(`/facturas/${id}/autorizar`);
    return response.data;
  },

  // Eliminar factura (solo borradores)
  eliminarFactura: async (id) => {
    const response = await api.delete(`/facturas/${id}`);
    return response.data;
  },

  // Editar factura (solo borradores)
  editarFactura: async (id, datosActualizados) => {
    const response = await api.put(`/facturas/${id}`, datosActualizados);
    return response.data;
  },

  // Listar conceptos para facturar
  listarConceptos: async () => {
    const response = await api.get('/conceptos-cobros');
    return response.data;
  },

  // Listar estudiantes
  listarEstudiantes: async () => {
    const response = await api.get('/students');
    return response.data;
  },

  // Listar cursos
  listarCursos: async () => {
    const response = await api.get('/cursos');
    return response.data;
  },

  // Obtener tarifa actual de un curso
  obtenerTarifaCurso: async (cursoId) => {
    const response = await api.get(`/cursos/${cursoId}`);
    return response.data;
  }
};

export default facturaService;