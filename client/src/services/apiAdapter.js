// client/src/services/apiAdapter.js

import api from './api' // Backend real existente
import mockApi from './mockApi' // Mock para demo
import { mockStudents } from './mockData'

// SWITCH PRINCIPAL - Cambiar aquí para alternar entre mock y real
// true = Usa datos mock (para demo sin backend)
// false = Usa backend real (cuando esté implementado)
const USE_MOCK = false

// Variable de entorno alternativa (opcional)
// const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true' || true

/**
 * Adaptador inteligente que redirige peticiones según configuración
 * * USO EN COMPONENTES:
 * import apiAdapter from '../services/apiAdapter'
 * const response = await apiAdapter.classes.getAll()
 */
const apiAdapter = {
  // ==================== CLASES (MODIFICADO) ====================
  classes: {
    /**
     * Obtener todas las clases con filtros opcionales
     * @param {Object} params - Filtros: teacherId, studentId, status, date, page, limit
     */
    getAll: async (params = {}) => {
      if (USE_MOCK) {
        return await mockApi.classes.getAll(params)
      }
      // CAMBIO: Ruta en español
      return await api.get('/clases', { params })
    },
    getMine: async (params = {}) => {
      if (USE_MOCK) {
        return await mockApi.classes.getAll(params)
      }
      return await api.get('/clases/profesor/mis-clases', { params })
    },

    /**
     * Crear nueva clase
     * @param {Object} classData - { studentId, teacherId, subject, date, time, duration }
     */
    create: async (classData) => {
      if (USE_MOCK) {
        return await mockApi.classes.create(classData)
      }
      // CAMBIO: Ruta en español
      return await api.post('/clases', classData)
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
      // CAMBIO: Ruta en español
      return await api.put(`/clases/${id}`, classData)
    },

    /**
     * Eliminar clase
     * @param {String} id - ID de la clase
     */
    delete: async (id, data = {}) => {
      if (USE_MOCK) {
        return await mockApi.classes.delete(id)
      }
      // CAMBIO: Ruta en español
      return await api.delete(`/clases/${id}`, { data })
    },

    /**
     * Obtener estadísticas de clases
     */
    getStats: async () => {
      if (USE_MOCK) {
        return await mockApi.classes.getStats()
      }
      // CAMBIO: Ruta en español
      return await api.get('/clases/stats')
    },

    /**
     * Obtener clase por ID
     */
    getById: async (id) => {
      if (USE_MOCK) {
        return await mockApi.classes.getById(id)
      }
      return await api.get(`/clases/${id}`)
    },

    /**
     * Registrar asistencia de un estudiante (profesor/admin)
     */
    registrarAsistencia: async (claseId, estudianteId, presente, minutosTarde = 0, comentarios = '') => {
      if (USE_MOCK) {
        return { data: { success: true, message: 'Asistencia registrada' } }
      }
      return await api.put(`/clases/${claseId}/asistencia`, {
        estudiante: estudianteId,
        presente,
        minutosTarde,
        comentarios
      })
    },

    /**
     * Registrar mi propia asistencia como estudiante
     */
    registrarMiAsistencia: async (claseId, presente, minutosTarde = 0, comentarios = '') => {
      if (USE_MOCK) {
        return { data: { success: true, message: 'Tu asistencia ha sido registrada' } }
      }
      return await api.post(`/clases/${claseId}/asistencia/estudiante`, {
        presente,
        minutosTarde,
        comentarios
      })
    },

    /**
     * Registrar asistencia múltiple (toda la clase)
     */
    registrarAsistenciaMultiple: async (claseId, asistencias) => {
      if (USE_MOCK) {
        return { data: { success: true, message: 'Asistencia registrada para todos' } }
      }
      return await api.put(`/clases/${claseId}/asistencia/multiple`, { asistencias })
    },

    /**
     * Obtener asistencia de una clase
     */
    obtenerAsistencia: async (claseId) => {
      if (USE_MOCK) {
        return { data: { success: true, data: { asistencia: [] } } }
      }
      return await api.get(`/clases/${claseId}/asistencia`)
    },

    /**
     * Obtener estadísticas de asistencia de un estudiante
     */
    obtenerEstadisticasAsistencia: async (estudianteId, cursoId = null) => {
      if (USE_MOCK) {
        return { 
          data: { 
            success: true, 
            data: { 
              totalClases: 0, 
              clasesAsistidas: 0, 
              porcentajeAsistencia: 0,
              esAlumnoRegular: false
            } 
          } 
        }
      }
      const url = cursoId 
        ? `/clases/asistencia/estudiante/${estudianteId}/curso/${cursoId}`
        : `/clases/asistencia/estudiante/${estudianteId}/curso/null`
      return await api.get(url)
    },

    /**
     * Obtener mis clases como estudiante
     */
    getMisClases: async (params = {}) => {
      if (USE_MOCK) {
        return await mockApi.classes.getAll(params)
      }
      return await api.get('/clases/estudiante/mis-clases', { params })
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

// ==================== CURSOS (MODIFICADO) ====================
  courses: {
    /**
     * Obtener todos los cursos.
     * @param {Object} params - { activeOnly: Boolean }
     */
    getAll: async (params = {}) => {
      if (USE_MOCK) {
        return await mockApi.courses.getAll(params);
      }
      // CAMBIO: Ruta en español
      return await api.get('/cursos', { params });
    },

    /**
     * Obtener cursos públicos sin autenticación
     * @param {Object} params - filtros y paginación opcionales
     */
    getPublic: async (params = {}) => {
      if (USE_MOCK) {
        return await mockApi.courses.getAll({
          ...params,
          activeOnly: params.activeOnly ?? false
        });
      }
      return await api.get('/cursos/publico', { params });
    },

    /**
     * Obtener un curso por ID
     * @param {String} id - ID del curso
     */
    getById: async (id) => {
      if (USE_MOCK) {
        return await mockApi.courses.getById(id);
      }
      // CAMBIO: Ruta en español
      return await api.get(`/cursos/${id}`);
    },

    /**
     * Crear un nuevo curso
     * @param {Object} courseData - Datos del curso a crear
     */
    create: async (courseData) => {
      if (USE_MOCK) {
        return await mockApi.courses.create(courseData);
      }
      // CAMBIO: Ruta en español
      return await api.post('/cursos', courseData);
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
      // CAMBIO: Ruta en español
      return await api.put(`/cursos/${id}`, courseData);
    },

    /**
     * Eliminar un curso
     * @param {String} id - ID del curso
     */
    delete: async (id) => {
      if (USE_MOCK) {
        return await mockApi.courses.delete(id);
      }
      // CAMBIO: Ruta en español
      return await api.delete(`/cursos/${id}`);
    },

    /**
     * Obtener horarios disponibles de un profesor para crear cursos
     * @param {String} profesorId - ID del profesor
     * @param {String} excludeCursoId - ID del curso a excluir (opcional, útil al editar)
     * @returns {Promise} Array de horarios disponibles
     */
    getAvailableSchedulesByTeacher: async (profesorId, excludeCursoId = null) => {
      if (USE_MOCK) {
        return await mockApi.courses.getAvailableSchedulesByTeacher(profesorId);
      }
      // Construir URL con query param si se está excluyendo un curso
      let url = `/cursos/profesor/${profesorId}/horarios-disponibles`;
      if (excludeCursoId) {
        url += `?excludeCursoId=${excludeCursoId}`;
      }
      return await api.get(url);
    },

    /**
     * Obtener mis cursos como estudiante
     */
    getMyCourses: async () => {
      if (USE_MOCK) {
        return { data: { success: true, data: [] } };
      }
      return await api.get('/cursos/estudiante/mis-cursos');
    },

    /**
     * Obtener estudiantes de un curso
     * @param {String} cursoId
     */
    getStudents: async (cursoId) => {
      if (USE_MOCK) {
        const course = mockCourses.find((c) => c._id === cursoId);
        if (!course || !course.estudiantes) {
          return {
            data: {
              success: true,
              data: []
            }
          };
        }
        const estudiantes = course.estudiantes.map((studentId) => {
          const student = mockStudents.find((s) => s._id === studentId);
          return {
            estudiante: student,
            fechaInscripcion: new Date().toISOString(),
            progreso: { horasCompletadas: 0, porcentaje: 0 }
          };
        });
        return {
          data: {
            success: true,
            data: estudiantes
          }
        };
      }
      return await api.get(`/cursos/${cursoId}/estudiantes`);
    },
    removeStudent: async (cursoId, estudianteId) => {
      if (USE_MOCK) {
        const course = mockCourses.find((c) => c._id === cursoId);
        if (course) {
          course.estudiantes = (course.estudiantes || []).filter((id) => id !== estudianteId);
        }
        return {
          data: {
            success: true
          }
        };
      }
      return await api.delete(`/cursos/${cursoId}/estudiantes/${estudianteId}`);
    },

    /**
     * Inscribir estudiante a un curso
     * @param {String} cursoId - ID del curso
     * @param {String} estudianteId - ID del estudiante
     */
    enroll: async (cursoId, estudianteId) => {
      if (USE_MOCK) {
        // Simular respuesta exitosa
        return {
          data: {
            success: true,
            message: 'Estudiante inscripto (mock)',
            data: {
              cursoId,
              estudianteId
            }
          }
        };
      }
      return await api.post(`/cursos/${cursoId}/inscribir`, { estudianteId });
    }
  },

  // ==================== PROFESORES  ====================
  /**
   *  `CoursesPage.jsx` necesita esta sección para cargar profesores reales.
   */
  teachers: {
    getAll: async (params = {}) => {
      if (USE_MOCK) {
        return await mockApi.teachers.getAll(params); 
      }
      // Apunta a la ruta real de profesores 
      const response = await api.get('/teachers', { params });
      // Normalizar respuesta para que data.data contenga el array directamente
      if (response.data.success && response.data.data && response.data.data.teachers) {
        return {
          ...response,
          data: {
            ...response.data,
            data: response.data.data.teachers
          }
        };
      }
      return response;
    }
  },

  // ==================== ESTUDIANTES ====================
  students: {
    getAll: async (params = {}) => {
      if (USE_MOCK) {
        const search = params.search ? params.search.toLowerCase() : '';
        let students = [...mockStudents];
        if (search) {
          students = students.filter((student) => {
            const fullName = `${student.firstName || ''} ${student.lastName || ''}`.toLowerCase();
            return (
              fullName.includes(search) ||
              (student.email || '').toLowerCase().includes(search)
            );
          });
        }
        return {
          data: {
            success: true,
            data: {
              students,
              pagination: {
                page: 1,
                limit: students.length,
                total: students.length,
                pages: 1,
                hasNext: false,
                hasPrev: false
              }
            }
          }
        };
      }
      return await api.get('/students', { params });
    }
  },

  // ==================== ALIASES EN ESPAÑOL (para compatibilidad) ====================
  cursos: {
    getAll: async (params = {}) => {
      if (USE_MOCK) {
        return await mockApi.courses.getAll(params);
      }
      return await api.get('/cursos', { params });
    },
    getPublic: async (params = {}) => {
      if (USE_MOCK) {
        return await mockApi.courses.getAll({
          ...params,
          activeOnly: params.activeOnly ?? true
        });
      }
      return await api.get('/cursos/publico', { params });
    },
    getMine: async () => {
      if (USE_MOCK) {
        return {
          data: {
            success: true,
            data: []
          }
        };
      }
      return await api.get('/cursos/profesor/mis-cursos');
    },
    getById: async (id) => {
      if (USE_MOCK) {
        return await mockApi.courses.getById(id);
      }
      return await api.get(`/cursos/${id}`);
    },
    create: async (courseData) => {
      if (USE_MOCK) {
        return await mockApi.courses.create(courseData);
      }
      return await api.post('/cursos', courseData);
    },
    update: async (id, courseData) => {
      if (USE_MOCK) {
        return await mockApi.courses.update(id, courseData);
      }
      return await api.put(`/cursos/${id}`, courseData);
    },
    delete: async (id) => {
      if (USE_MOCK) {
        return await mockApi.courses.delete(id);
      }
      return await api.delete(`/cursos/${id}`);
    },
    getAvailableSchedulesByTeacher: async (profesorId) => {
      if (USE_MOCK) {
        return await mockApi.courses.getAvailableSchedulesByTeacher(profesorId);
      }
      return await api.get(`/cursos/profesor/${profesorId}/horarios-disponibles`);
    },
    getStudents: async (cursoId) => {
      if (USE_MOCK) {
        const course = mockCourses.find((c) => c._id === cursoId);
        if (!course || !course.estudiantes) {
          return {
            data: {
              success: true,
              data: []
            }
          };
        }
        const estudiantes = course.estudiantes.map((studentId) => {
          const student = mockStudents.find((s) => s._id === studentId);
          return {
            estudiante: student,
            fechaInscripcion: new Date().toISOString(),
            progreso: { horasCompletadas: 0, porcentaje: 0 }
          };
        });
        return {
          data: {
            success: true,
            data: estudiantes
          }
        };
      }
      return await api.get(`/cursos/${cursoId}/estudiantes`);
    },
    removeStudent: async (cursoId, estudianteId) => {
      if (USE_MOCK) {
        const course = mockCourses.find((c) => c._id === cursoId);
        if (course) {
          course.estudiantes = (course.estudiantes || []).filter((id) => id !== estudianteId);
        }
        return {
          data: {
            success: true
          }
        };
      }
      return await api.delete(`/cursos/${cursoId}/estudiantes/${estudianteId}`);
    },
    enroll: async (cursoId, estudianteId) => {
      if (USE_MOCK) {
        return {
          data: {
            success: true,
            message: 'Estudiante inscripto (mock)',
            data: {
              cursoId,
              estudianteId
            }
          }
        };
      }
      return await api.post(`/cursos/${cursoId}/inscribir`, { estudianteId });
    }
  },
  profesores: {
    getAll: async (params = {}) => {
      if (USE_MOCK) {
        return await mockApi.teachers.getAll(params);
      }
      const response = await api.get('/teachers', { params });
      // Normalizar respuesta para que data.data contenga el array directamente
      if (response.data.success && response.data.data && response.data.data.teachers) {
        return {
          ...response,
          data: {
            ...response.data,
            data: response.data.data.teachers
          }
        };
      }
      return response;
    }
  },

  // ==================== SUBIDA DE ARCHIVOS ====================
  uploads: {
    /**
     * Subir imagen de un curso
     * @param {FormData} formData - Debe incluir el campo 'image'
     */
    uploadCourseImage: async (formData) => {
      if (USE_MOCK) {
        return await mockApi.uploads.uploadCourseImage(formData);
      }
      return await api.post('/uploads/course-image', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
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