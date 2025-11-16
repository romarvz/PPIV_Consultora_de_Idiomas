const { validationResult } = require('express-validator');
const userService = require('../services/userService');

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

    const filters = { role: 'estudiante' };
    
    // Filtro por texto (nombre, apellido, email, DNI)
    if (search) {
      filters.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { dni: { $regex: search, $options: 'i' } }
      ];
    }

    // Filtro por estado de cuenta
    if (status) {
      if (status === 'active') {
        filters.isActive = true;
      } else if (status === 'inactive') {
        filters.isActive = false;
      }
    }

    // level filter
    if (nivel) {
      filters.nivel = nivel;
    }

    // academic condition filter
    if (condicion) {
      filters.condicion = condicion;
    }

    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
      sort: { lastName: 1, firstName: 1 },
      select: '-password'
    };

    const result = await userService.findUsers(filters, options);

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


const getStudentById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const student = await userService.findUserById(id);
    
    if (!student || student.role !== 'estudiante') {
      return res.status(404).json({
        success: false,
        message: 'Estudiante no encontrado',
        code: 'STUDENT_NOT_FOUND'
      });
    }

    res.json({
      success: true,
      message: 'Estudiante obtenido exitosamente',
      data: {
        student: student.toJSON()
      }
    });

  } catch (error) {
    console.error('Error en getStudentById:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      code: 'INTERNAL_ERROR'
    });
  }
};

//  update student

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

    const student = await userService.findUserById(id);
    
    if (!student || student.role !== 'estudiante') {
      return res.status(404).json({
        success: false,
        message: 'Estudiante no encontrado',
        code: 'STUDENT_NOT_FOUND'
      });
    }

    // Capitalizar nombres y apellidos si se proporcionan
    const { capitalizeUserNames } = require('../utils/stringHelpers');
    
    const updateData = {};
    if (firstName) {
      updateData.firstName = capitalizeUserNames({ firstName }).firstName;
    }
    if (lastName) {
      updateData.lastName = capitalizeUserNames({ lastName }).lastName;
    }
    if (email) updateData.email = email;
    if (phone) updateData.phone = phone;
    if (dni) updateData.dni = dni;
    if (nivel) updateData.nivel = nivel;
    
    // map condicion to estadoAcademico
    if (condicion) {
      const estadoMap = {
        'activo': 'en_curso',
        'inactivo': 'suspendido', 
        'graduado': 'graduado'
      };
      updateData.estadoAcademico = estadoMap[condicion] || 'inscrito';
      // also store original condicion
      updateData.condicion = condicion;
    }
    
    if (estadoAcademico) updateData.estadoAcademico = estadoAcademico;
    if (fechaInicio) updateData.fechaInicio = fechaInicio;
    if (typeof isActive === 'boolean') updateData.isActive = isActive;

    const updatedStudent = await userService.updateUser(id, updateData);

    res.json({
      success: true,
      message: 'Estudiante actualizado exitosamente',
      data: {
        student: updatedStudent.toJSON()
      }
    });

  } catch (error) {
    console.error('Error en updateStudent:', error);
    
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

// @endpoint to deactivate student


const deactivateStudent = async (req, res) => {
  try {
    const { id } = req.params;
    
    const student = await userService.findUserById(id);
    
    if (!student || student.role !== 'estudiante') {
      return res.status(404).json({
        success: false,
        message: 'Estudiante no encontrado',
        code: 'STUDENT_NOT_FOUND'
      });
    }

    const updatedStudent = await userService.updateUser(id, { isActive: false });

    res.json({
      success: true,
      message: 'Estudiante desactivado exitosamente',
      data: {
        student: updatedStudent.toJSON()
      }
    });

  } catch (error) {
    console.error('Error en deactivateStudent:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      code: 'INTERNAL_ERROR'
    });
  }
};

// endpoint to reactivate student
const reactivateStudent = async (req, res) => {
  try {
    const { id } = req.params;
    
    const student = await userService.findUserById(id);
    
    if (!student || student.role !== 'estudiante') {
      return res.status(404).json({
        success: false,
        message: 'Estudiante no encontrado',
        code: 'STUDENT_NOT_FOUND'
      });
    }

    const updatedStudent = await userService.updateUser(id, { isActive: true });

    res.json({
      success: true,
      message: 'Estudiante reactivado exitosamente',
      data: {
        student: updatedStudent.toJSON()
      }
    });

  } catch (error) {
    console.error('Error en reactivateStudent:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      code: 'INTERNAL_ERROR'
    });
  }
};

// get students statistics

const getStudentsStats = async (req, res) => {
  try {
    const totalStudents = await userService.countUsers({ role: 'estudiante' });
    const activeStudents = await userService.countUsers({ role: 'estudiante', isActive: true });
    const inactiveStudents = await userService.countUsers({ role: 'estudiante', isActive: false });
    
    // level statistics
    const levelStats = await userService.getAggregateStats([
      { $match: { role: 'estudiante', isActive: true } },
      { $group: { _id: '$nivel', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    // academic condition statistics
    const conditionStats = await userService.getAggregateStats([
      { $match: { role: 'estudiante', isActive: true } },
      { $group: { _id: '$condicion', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    res.json({
      success: true,
      message: 'Estadísticas de estudiantes obtenidas exitosamente',
      data: {
        overview: {
          total: totalStudents,
          active: activeStudents,
          inactive: inactiveStudents
        },
        byLevel: levelStats,
        byCondition: conditionStats
      }
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