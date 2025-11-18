const { validationResult } = require('express-validator');
const studentService = require('../services/studentService');

// Función auxiliar para manejar errores de validación
const handleValidationErrors = (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Errores de validación',
      errors: errors.array().map(error => ({
        field: error.path,
        message: error.msg
      }))
    });
  }
  return null;
};

/**
 * GET /api/students
 * Lista estudiantes con filtros y paginación
 * ✅ CORRECTO - Usa service para lógica de negocio
 */
const getStudents = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      search, 
      status, 
      nivel, 
      condicion 
    } = req.query;

    const filtros = { search, status, nivel, condicion };
    const opciones = {
      page: parseInt(page),
      limit: parseInt(limit)
    };

    const result = await studentService.listarEstudiantes(filtros, opciones);

    res.json({
      success: true,
      message: 'Estudiantes obtenidos exitosamente',
      data: {
        students: result.docs,
        pagination: {
          page: result.page,
          limit: result.limit,
          total: result.totalDocs,
          pages: result.totalPages,
          hasNext: result.hasNextPage,
          hasPrev: result.hasPrevPage
        }
      }
    });

  } catch (error) {
    console.error('Error en getStudents:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      code: 'INTERNAL_ERROR'
    });
  }
};


/**
 * GET /api/students/:id
 * Obtiene un estudiante por ID
 * ✅ CORRECTO - Usa service para lógica de negocio
 */
const getStudentById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const student = await studentService.obtenerEstudiantePorId(id);

    res.json({
      success: true,
      message: 'Estudiante obtenido exitosamente',
      data: {
        student: student.toJSON()
      }
    });

  } catch (error) {
    console.error('Error en getStudentById:', error);
    
    if (error.message === 'Estudiante no encontrado') {
      return res.status(404).json({
        success: false,
        message: error.message,
        code: 'STUDENT_NOT_FOUND'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      code: 'INTERNAL_ERROR'
    });
  }
};

/**
 * PUT /api/students/:id
 * Actualiza un estudiante
 * ✅ CORRECTO - Usa service para lógica de negocio
 */
const updateStudent = async (req, res) => {
  try {
    const validationError = handleValidationErrors(req, res);
    if (validationError) return validationError;

    const { id } = req.params;
    const { 
      firstName, 
      lastName, 
      email, 
      phone, 
      dni,
      nivel, 
      condicion, 
      estadoAcademico,
      fechaInicio,
      isActive 
    } = req.body;

    const updateData = {};
    if (firstName) updateData.firstName = firstName;
    if (lastName) updateData.lastName = lastName;
    if (email) updateData.email = email;
    if (phone) updateData.phone = phone;
    if (dni) updateData.dni = dni;
    if (nivel) updateData.nivel = nivel;
    if (condicion) updateData.condicion = condicion;
    if (estadoAcademico) updateData.estadoAcademico = estadoAcademico;
    if (fechaInicio) updateData.fechaInicio = fechaInicio;
    if (typeof isActive === 'boolean') updateData.isActive = isActive;

    const updatedStudent = await studentService.actualizarEstudiante(id, updateData);

    res.json({
      success: true,
      message: 'Estudiante actualizado exitosamente',
      data: {
        student: updatedStudent.toJSON()
      }
    });

  } catch (error) {
    console.error('Error en updateStudent:', error);
    
    if (error.message === 'Estudiante no encontrado') {
      return res.status(404).json({
        success: false,
        message: error.message,
        code: 'STUDENT_NOT_FOUND'
      });
    }
    
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Ya existe un usuario con este email',
        code: 'DUPLICATE_EMAIL'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      code: 'INTERNAL_ERROR'
    });
  }
};

/**
 * PUT /api/students/:id/deactivate
 * Desactiva un estudiante
 * ✅ CORRECTO - Usa service para lógica de negocio
 */
const deactivateStudent = async (req, res) => {
  try {
    const { id } = req.params;
    
    const updatedStudent = await studentService.desactivarEstudiante(id);

    res.json({
      success: true,
      message: 'Estudiante desactivado exitosamente',
      data: {
        student: updatedStudent.toJSON()
      }
    });

  } catch (error) {
    console.error('Error en deactivateStudent:', error);
    
    if (error.message === 'Estudiante no encontrado') {
      return res.status(404).json({
        success: false,
        message: error.message,
        code: 'STUDENT_NOT_FOUND'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      code: 'INTERNAL_ERROR'
    });
  }
};

/**
 * PUT /api/students/:id/reactivate
 * Reactiva un estudiante
 * ✅ CORRECTO - Usa service para lógica de negocio
 */
const reactivateStudent = async (req, res) => {
  try {
    const { id } = req.params;
    
    const updatedStudent = await studentService.reactivarEstudiante(id);

    res.json({
      success: true,
      message: 'Estudiante reactivado exitosamente',
      data: {
        student: updatedStudent.toJSON()
      }
    });

  } catch (error) {
    console.error('Error en reactivateStudent:', error);
    
    if (error.message === 'Estudiante no encontrado') {
      return res.status(404).json({
        success: false,
        message: error.message,
        code: 'STUDENT_NOT_FOUND'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      code: 'INTERNAL_ERROR'
    });
  }
};

/**
 * GET /api/students/stats
 * Obtiene estadísticas de estudiantes
 * ✅ CORRECTO - Usa service para lógica de negocio
 */
const getStudentsStats = async (req, res) => {
  try {
    const estadisticas = await studentService.obtenerEstadisticasEstudiantes();

    res.json({
      success: true,
      message: 'Estadísticas de estudiantes obtenidas exitosamente',
      data: estadisticas
    });

  } catch (error) {
    console.error('Error en getStudentsStats:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      code: 'INTERNAL_ERROR'
    });
  }
};

module.exports = {
  getStudents,
  getStudentById,
  updateStudent,
  deactivateStudent,
  reactivateStudent,
  getStudentsStats
};