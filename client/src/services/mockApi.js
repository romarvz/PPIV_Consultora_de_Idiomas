// API Mock completa para simular el backend

import { 
  mockStudents, 
  mockTeachers, 
  mockClasses, 
  mockPayments,
  mockLanguages,
  mockCompanies,
  mockCourses,
  mockFinancialData
} from './mockData'

// Simular delay de red realista
const delay = (ms = 300 + Math.random() * 400) => 
  new Promise(resolve => setTimeout(resolve, ms))

// Storage local para persistencia temporal en sesión
const initStorage = () => {
  const stored = sessionStorage.getItem('mockApiStorage')
  if (stored) {
    return JSON.parse(stored)
  }
  return {
    students: [...mockStudents],
    teachers: [...mockTeachers],
    classes: [...mockClasses],
    payments: [...mockPayments],
    languages: [...mockLanguages],
    companies: [...mockCompanies],
    courses: [...mockCourses]
  }
}

let storage = initStorage()

// Guardar en sessionStorage cuando cambie
const saveStorage = () => {
  sessionStorage.setItem('mockApiStorage', JSON.stringify(storage))
}

// Utilidad para generar IDs únicos
const generateId = (prefix) => `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

// ==================== MOCK API ====================
export const mockApi = {
  // ==================== CLASES ====================
  classes: {
    /**
     * Obtener todas las clases con filtros opcionales
     */
    getAll: async (params = {}) => {
      await delay()
      let filtered = [...storage.classes]
      
      // Filtros
      if (params.teacherId) {
        filtered = filtered.filter(c => c.teacherId === params.teacherId)
      }
      if (params.studentId) {
        filtered = filtered.filter(c => c.studentId === params.studentId)
      }
      if (params.status) {
        filtered = filtered.filter(c => c.status === params.status)
      }
      if (params.date) {
        filtered = filtered.filter(c => c.date === params.date)
      }
      if (params.subject) {
        filtered = filtered.filter(c => c.subject.toLowerCase().includes(params.subject.toLowerCase()))
      }
      
      // Ordenar por fecha descendente
      filtered.sort((a, b) => new Date(b.date) - new Date(a.date))
      
      // Paginación
      const page = parseInt(params.page) || 1
      const limit = parseInt(params.limit) || 10
      const startIndex = (page - 1) * limit
      const endIndex = startIndex + limit
      const paginated = filtered.slice(startIndex, endIndex)
      
      return {
        data: {
          success: true,
          data: {
            classes: paginated,
            total: filtered.length,
            page,
            pages: Math.ceil(filtered.length / limit)
          }
        }
      }
    },

    /**
     * Crear nueva clase
     */
    create: async (classData) => {
      await delay()
      
      // Validaciones
      if (!classData.studentId || !classData.teacherId) {
        throw new Error('Estudiante y profesor son requeridos')
      }
      
      // Buscar nombres
      const student = storage.students.find(s => s._id === classData.studentId)
      const teacher = storage.teachers.find(t => t._id === classData.teacherId)
      
      if (!student || !teacher) {
        throw new Error('Estudiante o profesor no encontrado')
      }
      
      // Validar conflictos de horario
      const existingClass = storage.classes.find(c => 
        c.teacherId === classData.teacherId &&
        c.date === classData.date &&
        c.time === classData.time &&
        c.status !== 'cancelada'
      )
      
      if (existingClass) {
        throw new Error('El profesor ya tiene una clase programada en ese horario')
      }
      
      const newClass = {
        _id: generateId('mock-class'),
        studentId: classData.studentId,
        studentName: `${student.firstName} ${student.lastName}`,
        teacherId: classData.teacherId,
        teacherName: `${teacher.firstName} ${teacher.lastName}`,
        subject: classData.subject || 'Inglés',
        nivel: student.nivel,
        date: classData.date,
        time: classData.time,
        duration: classData.duration || 60,
        status: 'programada',
        createdAt: new Date().toISOString()
      }
      
      storage.classes.unshift(newClass)
      saveStorage()
      
      return {
        data: {
          success: true,
          data: newClass,
          message: 'Clase programada exitosamente'
        }
      }
    },

    /**
     * Actualizar clase existente
     */
    update: async (id, classData) => {
      await delay()
      const index = storage.classes.findIndex(c => c._id === id)
      
      if (index === -1) {
        throw new Error('Clase no encontrada')
      }
      
      storage.classes[index] = { 
        ...storage.classes[index], 
        ...classData,
        updatedAt: new Date().toISOString()
      }
      saveStorage()
      
      return {
        data: {
          success: true,
          data: storage.classes[index],
          message: 'Clase actualizada exitosamente'
        }
      }
    },

    /**
     * Eliminar clase
     */
    delete: async (id) => {
      await delay()
      const index = storage.classes.findIndex(c => c._id === id)
      
      if (index === -1) {
        throw new Error('Clase no encontrada')
      }
      
      storage.classes.splice(index, 1)
      saveStorage()
      
      return {
        data: {
          success: true,
          message: 'Clase eliminada exitosamente'
        }
      }
    },

    /**
     * Obtener estadísticas de clases
     */
    getStats: async () => {
      await delay()
      const total = storage.classes.length
      const programadas = storage.classes.filter(c => c.status === 'programada').length
      const completadas = storage.classes.filter(c => c.status === 'completada').length
      const canceladas = storage.classes.filter(c => c.status === 'cancelada').length
      
      // Próximas clases (próximos 7 días)
      const today = new Date()
      const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000)
      const upcoming = storage.classes.filter(c => {
        const classDate = new Date(c.date)
        return c.status === 'programada' && classDate >= today && classDate <= nextWeek
      }).length
      
      return {
        data: {
          success: true,
          data: {
            total,
            programadas,
            completadas,
            canceladas,
            upcoming
          }
        }
      }
    }
  },

  // ==================== PAGOS ====================
  payments: {
    /**
     * Obtener todos los pagos con filtros
     */
    getAll: async (params = {}) => {
      await delay()
      let filtered = [...storage.payments]
      
      // Filtros
      if (params.studentId) {
        filtered = filtered.filter(p => p.studentId === params.studentId)
      }
      if (params.status) {
        filtered = filtered.filter(p => p.status === params.status)
      }
      if (params.dateFrom) {
        filtered = filtered.filter(p => new Date(p.date) >= new Date(params.dateFrom))
      }
      if (params.dateTo) {
        filtered = filtered.filter(p => new Date(p.date) <= new Date(params.dateTo))
      }
      
      // Ordenar por fecha descendente
      filtered.sort((a, b) => new Date(b.date) - new Date(a.date))
      
      // Calcular totales
      const totalAmount = filtered.reduce((sum, p) => sum + p.amount, 0)
      const paidAmount = filtered.filter(p => p.status === 'pagado').reduce((sum, p) => sum + p.amount, 0)
      const pendingAmount = filtered.filter(p => p.status === 'pendiente').reduce((sum, p) => sum + p.amount, 0)
      
      // Paginación
      const page = parseInt(params.page) || 1
      const limit = parseInt(params.limit) || 10
      const startIndex = (page - 1) * limit
      const endIndex = startIndex + limit
      const paginated = filtered.slice(startIndex, endIndex)
      
      return {
        data: {
          success: true,
          data: {
            payments: paginated,
            total: filtered.length,
            totalAmount,
            paidAmount,
            pendingAmount,
            page,
            pages: Math.ceil(filtered.length / limit)
          }
        }
      }
    },

    /**
     * Crear nuevo pago
     */
    create: async (paymentData) => {
      await delay()
      
      // Validaciones
      if (!paymentData.studentId || !paymentData.amount) {
        throw new Error('Estudiante y monto son requeridos')
      }
      
      // Buscar estudiante
      const student = storage.students.find(s => s._id === paymentData.studentId)
      if (!student) {
        throw new Error('Estudiante no encontrado')
      }
      
      const newPayment = {
        _id: generateId('mock-payment'),
        studentId: paymentData.studentId,
        studentName: `${student.firstName} ${student.lastName}`,
        amount: parseFloat(paymentData.amount),
        concept: paymentData.concept || 'Pago de curso',
        date: paymentData.date || new Date().toISOString().split('T')[0],
        dueDate: paymentData.dueDate || null,
        status: paymentData.status || 'pendiente',
        paymentMethod: paymentData.paymentMethod || null,
        createdAt: new Date().toISOString()
      }
      
      storage.payments.unshift(newPayment)
      saveStorage()
      
      return {
        data: {
          success: true,
          data: newPayment,
          message: 'Pago registrado exitosamente'
        }
      }
    },

    /**
     * Actualizar pago existente
     */
    update: async (id, paymentData) => {
      await delay()
      const index = storage.payments.findIndex(p => p._id === id)
      
      if (index === -1) {
        throw new Error('Pago no encontrado')
      }
      
      storage.payments[index] = { 
        ...storage.payments[index], 
        ...paymentData,
        updatedAt: new Date().toISOString()
      }
      saveStorage()
      
      return {
        data: {
          success: true,
          data: storage.payments[index],
          message: 'Pago actualizado exitosamente'
        }
      }
    },

    /**
     * Eliminar pago
     */
    delete: async (id) => {
      await delay()
      const index = storage.payments.findIndex(p => p._id === id)
      
      if (index === -1) {
        throw new Error('Pago no encontrado')
      }
      
      storage.payments.splice(index, 1)
      saveStorage()
      
      return {
        data: {
          success: true,
          message: 'Pago eliminado exitosamente'
        }
      }
    },

    /**
     * Obtener estadísticas de pagos
     */
    getStats: async () => {
      await delay()
      const total = storage.payments.length
      const pagados = storage.payments.filter(p => p.status === 'pagado')
      const pendientes = storage.payments.filter(p => p.status === 'pendiente')
      const vencidos = storage.payments.filter(p => p.status === 'vencido')
      
      const totalIncome = pagados.reduce((sum, p) => sum + p.amount, 0)
      const pendingIncome = pendientes.reduce((sum, p) => sum + p.amount, 0)
      const overdueAmount = vencidos.reduce((sum, p) => sum + p.amount, 0)
      
      // Ingresos por mes (últimos 6 meses)
      const monthlyIncome = {}
      const today = new Date()
      
      for (let i = 5; i >= 0; i--) {
        const date = new Date(today.getFullYear(), today.getMonth() - i, 1)
        const monthKey = date.toISOString().substring(0, 7) // YYYY-MM
        const monthName = date.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })
        
        const monthPayments = pagados.filter(p => p.date.startsWith(monthKey))
        monthlyIncome[monthName] = monthPayments.reduce((sum, p) => sum + p.amount, 0)
      }
      
      return {
        data: {
          success: true,
          data: {
            total,
            paid: pagados.length,
            pending: pendientes.length,
            overdue: vencidos.length,
            totalIncome,
            pendingIncome,
            overdueAmount,
            monthlyIncome
          }
        }
      }
    }
  },


  // ==================== CURSOS (PLANTILLAS) - NUEVA SECCIÓN ====================
  courses: {
    /**
     * Obtener todos los cursos.
     * Si `activeOnly` es true, solo devuelve los que tienen isActive = true.
     */
    getAll: async (params = { activeOnly: false }) => {
      await delay();
      let courses = [...storage.courses];
      
      if (params.activeOnly) {
        courses = courses.filter(course => course.isActive);
      }
      
      // Ordenar por nombre para consistencia
      courses.sort((a, b) => a.name.localeCompare(b.name));
      
      return {
        data: {
          success: true,
          data: {
            courses,
            total: courses.length
          }
        }
      };
    },

    /**
     * Obtener un curso por su ID.
     */
    getById: async (id) => {
      await delay();
      const course = storage.courses.find(c => c._id === id);
      
      if (!course) {
        throw new Error('Curso no encontrado');
      }
      
      return { data: { success: true, data: course } };
    },

    /**
     * Crear un nuevo curso.
     */
    create: async (courseData) => {
      await delay();
      if (!courseData.name || !courseData.language) {
        throw new Error('El nombre y el idioma son requeridos');
      }
      
      const newCourse = {
        _id: generateId('course'),
        ...courseData,
        createdAt: new Date().toISOString(),
        isActive: courseData.isActive !== undefined ? courseData.isActive : true
      };
      
      storage.courses.unshift(newCourse);
      saveStorage();
      
      return { data: { success: true, data: newCourse, message: 'Curso creado exitosamente' } };
    },

    /**
     * Actualizar un curso existente.
     */
    update: async (id, courseData) => {
      await delay();
      const index = storage.courses.findIndex(c => c._id === id);
      
      if (index === -1) {
        throw new Error('Curso no encontrado');
      }
      
      storage.courses[index] = {
        ...storage.courses[index],
        ...courseData,
        updatedAt: new Date().toISOString()
      };
      saveStorage();
      
      return { data: { success: true, data: storage.courses[index], message: 'Curso actualizado' } };
    },

    /**
     * Eliminar un curso.
     */
    delete: async (id) => {
      await delay();
      const index = storage.courses.findIndex(c => c._id === id);
      
      if (index === -1) {
        throw new Error('Curso no encontrado');
      }
      
      storage.courses.splice(index, 1);
      saveStorage();
      
      return { data: { success: true, message: 'Curso eliminado exitosamente' } };
    },

    /**
     * Obtener horarios disponibles de un profesor para crear cursos
     * @param {String} profesorId - ID del profesor
     * @returns {Promise} Horarios disponibles en formato del modelo Horario.js
     */
    getAvailableSchedulesByTeacher: async (profesorId) => {
      await delay(); // Simular latencia de red
      
      // Buscar el profesor en el storage mock
      const teacher = storage.teachers.find(t => t._id === profesorId);
      
      if (!teacher || !teacher.horarios) {
        return { data: { success: true, data: { horarios: [], count: 0 } } };
      }
      
      // Transformar los datos del mock al formato del modelo Horario.js
      let availableSchedules = teacher.horarios.map((h, index) => {
        const diaCapitalizado = h.dia.charAt(0).toUpperCase() + h.dia.slice(1);
        return {
          _id: `mock-horario-${teacher._id}-${index}`, // ID único simulado
          dia: h.dia,
          horaInicio: h.horaInicio,
          horaFin: h.horaFin,
          tipo: 'clase',
          display: `${diaCapitalizado} ${h.horaInicio} - ${h.horaFin}`
        };
      });
      
      // Simular que un horario está "ocupado" (opcional, para testing)
      if (availableSchedules.length > 1) {
        availableSchedules.splice(0, 1); // Quita el primero para simular ocupación
      }
      
      return { 
        data: { 
          success: true, 
          data: { 
            horarios: availableSchedules, 
            count: availableSchedules.length 
          },
          message: `Horarios disponibles obtenidos: ${availableSchedules.length} encontrados`
        } 
      };
    }
  },
 
  
  // ==================== REPORTES ====================
  reports: {
    /**
     * Reporte académico de estudiantes
     */
    academic: async (params = {}) => {
      await delay()
      
      let students = [...storage.students]
      
      // Filtrar por estado si se proporciona
      if (params.status) {
        students = students.filter(s => s.condicion === params.status)
      }
      
      const studentsWithProgress = students.map(student => {
        const studentClasses = storage.classes.filter(c => c.studentId === student._id)
        const completedClasses = studentClasses.filter(c => c.status === 'completada').length
        const totalClasses = studentClasses.length
        const attendance = totalClasses > 0 
          ? Math.round((completedClasses / totalClasses) * 100) 
          : 0
        
        return {
          _id: student._id,
          firstName: student.firstName,
          lastName: student.lastName,
          email: student.email,
          nivel: student.nivel,
          condicion: student.condicion,
          totalClasses,
          completedClasses,
          attendance,
          isActive: student.isActive
        }
      })
      
      // Ordenar por asistencia descendente
      studentsWithProgress.sort((a, b) => b.attendance - a.attendance)
      
      return {
        data: {
          success: true,
          data: {
            students: studentsWithProgress,
            total: studentsWithProgress.length,
            averageAttendance: Math.round(
              studentsWithProgress.reduce((sum, s) => sum + s.attendance, 0) / studentsWithProgress.length
            )
          }
        }
      }
    },

    /**
     * Reporte financiero
     */
    financial: async (params = {}) => {
      await delay()
      
      return {
        data: {
          success: true,
          data: {
            totalIncome: mockFinancialData.totalIncome,
            pendingIncome: mockFinancialData.pendingIncome,
            topStudents: mockFinancialData.topStudents
          }
        }
      }
    },

    /**
     * Reporte de profesores
     */
    teachers: async () => {
      await delay()
      
      const teachersWithStats = storage.teachers.map(teacher => {
        const teacherClasses = storage.classes.filter(c => c.teacherId === teacher._id)
        const completedClasses = teacherClasses.filter(c => c.status === 'completada').length
        const scheduledClasses = teacherClasses.filter(c => c.status === 'programada').length
        const totalHours = completedClasses * 1 // Asumiendo 1 hora por clase
        const estimatedEarnings = totalHours * (teacher.tarifaPorHora || 0)
        
        return {
          _id: teacher._id,
          firstName: teacher.firstName,
          lastName: teacher.lastName,
          email: teacher.email,
          especialidades: teacher.especialidades.map(e => e.name).join(', '),
          totalClasses: teacherClasses.length,
          completedClasses,
          scheduledClasses,
          totalHours,
          tarifaPorHora: teacher.tarifaPorHora,
          estimatedEarnings,
          isActive: teacher.isActive
        }
      })
      
      return {
        data: {
          success: true,
          data: {
            teachers: teachersWithStats,
            total: teachersWithStats.length
          }
        }
      }
    }
  },

  // ==================== EMPRESAS ====================
  companies: {
    /**
     * Obtener todas las empresas
     */
    getAll: async () => {
      await delay()
      return {
        data: {
          success: true,
          data: {
            companies: storage.companies,
            total: storage.companies.length
          }
        }
      }
    },

    /**
     * Obtener empresa por ID
     */
    getById: async (id) => {
      await delay()
      const company = storage.companies.find(c => c._id === id)
      
      if (!company) {
        throw new Error('Empresa no encontrada')
      }
      
      return {
        data: {
          success: true,
          data: company
        }
      }
    }
  },

  // ==================== UTILIDADES ====================
  utils: {
    /**
     * Resetear datos mock a valores iniciales
     */
    reset: () => {
      storage = {
        students: [...mockStudents],
        teachers: [...mockTeachers],
        classes: [...mockClasses],
        payments: [...mockPayments],
        languages: [...mockLanguages],
        companies: [...mockCompanies],
        courses: [...mockCourses]
      }
      saveStorage()
      return { success: true, message: 'Datos reseteados exitosamente' }
    },

    /**
     * Obtener estado actual del storage
     */
    getStorageState: () => {
      return {
        studentsCount: storage.students.length,
        teachersCount: storage.teachers.length,
        classesCount: storage.classes.length,
        paymentsCount: storage.payments.length,
        coursesCount: storage.courses.length
      }
    }
  }
}

// Exportar funciones individuales para facilitar importación
export default mockApi