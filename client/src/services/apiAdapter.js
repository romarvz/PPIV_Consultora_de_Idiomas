// Adaptador inteligente que alterna entre Mock y Backend Real

import api from './api' // Backend real existente
import mockApi from './mockApi' // Mock para demo

// SWITCH PRINCIPAL - Cambiar aquí para alternar entre mock y real
// true = Usa datos mock (para demo sin backend)
// false = Usa backend real (cuando esté implementado)
const USE_MOCK = true

// Variable de entorno alternativa (opcional)
// const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true' || true

/**
 * Adaptador inteligente que redirige peticiones según configuración
 * 
 * USO EN COMPONENTES:
 * import apiAdapter from '../services/apiAdapter'
 * const response = await apiAdapter.classes.getAll()
 */
const apiAdapter = {
  // ==================== CLASES ====================
  classes: {
    /**
     * Obtener todas las clases con filtros opcionales
     * @param {Object} params - Filtros: teacherId, studentId, status, date, page, limit
     */
    getAll: async (params = {}) => {
      if (USE_MOCK) {
        return await mockApi.classes.getAll(params)
      }
      // Cuando implementemos el endpoint real:
      return await api.get('/classes', { params })
    },

    /**
     * Crear nueva clase
     * @param {Object} classData - { studentId, teacherId, subject, date, time, duration }
     */
    create: async (classData) => {
      if (USE_MOCK) {
        return await mockApi.classes.create(classData)
      }
      return await api.post('/classes', classData)
    },

    /**
     * Actualizar clase existente
     * @param {String} id - ID de la clase
     * @param {Object} classData - Datos a actualizar
     */
    update: async (id, classData) => {
      if (USE_MOCK) {
        return await mockApi.classes.update(id, classData)
      }
      return await api.put(`/classes/${id}`, classData)
    },

    /**
     * Eliminar clase
     * @param {String} id - ID de la clase
     */
    delete: async (id) => {
      if (USE_MOCK) {
        return await mockApi.classes.delete(id)
      }
      return await api.delete(`/classes/${id}`)
    },

    /**
     * Obtener estadísticas de clases
     */
    getStats: async () => {
      if (USE_MOCK) {
        return await mockApi.classes.getStats()
      }
      return await api.get('/classes/stats')
    }
  },

  // ==================== PAGOS ====================
  payments: {
    /**
     * Obtener todos los pagos con filtros
     * @param {Object} params - Filtros: studentId, status, dateFrom, dateTo, page, limit
     */
    getAll: async (params = {}) => {
      if (USE_MOCK) {
        return await mockApi.payments.getAll(params)
      }
      return await api.get('/payments', { params })
    },

    /**
     * Crear nuevo pago
     * @param {Object} paymentData - { studentId, amount, concept, date, status, paymentMethod }
     */
    create: async (paymentData) => {
      if (USE_MOCK) {
        return await mockApi.payments.create(paymentData)
      }
      return await api.post('/payments', paymentData)
    },

    /**
     * Actualizar pago existente
     * @param {String} id - ID del pago
     * @param {Object} paymentData - Datos a actualizar
     */
    update: async (id, paymentData) => {
      if (USE_MOCK) {
        return await mockApi.payments.update(id, paymentData)
      }
      return await api.put(`/payments/${id}`, paymentData)
    },

    /**
     * Eliminar pago
     * @param {String} id - ID del pago
     */
    delete: async (id) => {
      if (USE_MOCK) {
        return await mockApi.payments.delete(id)
      }
      return await api.delete(`/payments/${id}`)
    },

    /**
     * Obtener estadísticas de pagos
     */
    getStats: async () => {
      if (USE_MOCK) {
        return await mockApi.payments.getStats()
      }
      return await api.get('/payments/stats')
    }
  },

 // ==================== CURSOS (PLANTILLAS) - NUEVA SECCIÓN ====================
  courses: {
    /**
     * Obtener todos los cursos.
     * @param {Object} params - { activeOnly: Boolean }
     */
    getAll: async (params = {}) => {
      if (USE_MOCK) {
        return await mockApi.courses.getAll(params);
      }
      return await api.get('/courses', { params });
    },

    /**
     * Obtener un curso por ID
     * @param {String} id - ID del curso
     */
    getById: async (id) => {
      if (USE_MOCK) {
        return await mockApi.courses.getById(id);
      }
      return await api.get(`/courses/${id}`);
    },

    /**
     * Crear un nuevo curso
     * @param {Object} courseData - Datos del curso a crear
     */
    create: async (courseData) => {
      if (USE_MOCK) {
        return await mockApi.courses.create(courseData);
      }
      return await api.post('/courses', courseData);
    },

    /**
     * Actualizar un curso
     * @param {String} id - ID del curso
     * @param {Object} courseData - Datos a actualizar
     */
    update: async (id, courseData) => {
      if (USE_MOCK) {
        return await mockApi.courses.update(id, courseData);
      }
      return await api.put(`/courses/${id}`, courseData);
    },

    /**
     * Eliminar un curso
     * @param {String} id - ID del curso
     */
    delete: async (id) => {
      if (USE_MOCK) {
        return await mockApi.courses.delete(id);
      }
      return await api.delete(`/courses/${id}`);
    }
  },


  // ==================== REPORTES ====================
  reports: {
    /**
     * Reporte académico de estudiantes
     * @param {Object} params - Filtros: status
     */
    academic: async (params = {}) => {
      if (USE_MOCK) {
        return await mockApi.reports.academic(params)
      }
      return await api.get('/reports/academic', { params })
    },

    /**
     * Reporte financiero
     * @param {Object} params - Filtros: dateFrom, dateTo
     */
    financial: async (params = {}) => {
      if (USE_MOCK) {
        return await mockApi.reports.financial(params)
      }
      return await api.get('/reports/financial', { params })
    },

    /**
     * Reporte de profesores
     */
    teachers: async () => {
      if (USE_MOCK) {
        return await mockApi.reports.teachers()
      }
      return await api.get('/reports/teachers')
    }
  },

  // ==================== EMPRESAS (para CompanyDashboard) ====================
  companies: {
    /**
     * Obtener todas las empresas
     */
    getAll: async () => {
      if (USE_MOCK) {
        return await mockApi.companies.getAll()
      }
      return await api.get('/companies')
    },

    /**
     * Obtener empresa por ID
     * @param {String} id - ID de la empresa
     */
    getById: async (id) => {
      if (USE_MOCK) {
        return await mockApi.companies.getById(id)
      }
      return await api.get(`/companies/${id}`)
    }
  },

  // ==================== UTILIDADES ====================
  utils: {
    /**
     * Verificar si está usando mock
     */
    isUsingMock: () => USE_MOCK,

    /**
     * Resetear datos mock (solo si usa mock)
     */
    resetMockData: () => {
      if (USE_MOCK) {
        return mockApi.utils.reset()
      }
      return { success: false, message: 'No está usando datos mock' }
    },

    /**
     * Obtener estado del storage mock
     */
    getStorageState: () => {
      if (USE_MOCK) {
        return mockApi.utils.getStorageState()
      }
      return null
    }
  }
}

export default apiAdapter

// Exportar también el valor del switch para debugging
export { USE_MOCK }