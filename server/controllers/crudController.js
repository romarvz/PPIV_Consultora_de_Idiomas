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

// ==================== GESTIÓN DE ESTUDIANTES ====================

// @desc    Listar todos los estudiantes con filtros
// @route   GET /api/students
// @access  Private (Admin)
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
    
    // Filtro por texto (nombre, apellido, email)
    if (search) {
      filters.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
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

    // Filtro por nivel
    if (nivel) {
      filters.nivel = nivel;
    }

    // Filtro por condición académica
    if (condicion) {
      filters.condicion = condicion;
    }

    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
      sort: { createdAt: -1 },
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

// @desc    Obtener un estudiante por ID
// @route   GET /api/students/:id
// @access  Private (Admin)
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

// @desc    Actualizar estudiante
// @route   PUT /api/students/:id
// @access  Private (Admin)
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

    const updateData = {};
    if (firstName) updateData.firstName = firstName;
    if (lastName) updateData.lastName = lastName;
    if (email) updateData.email = email;
    if (phone) updateData.phone = phone;
    if (dni) updateData.dni = dni;
    if (nivel) updateData.nivel = nivel;
    
    // Mapear condicion del frontend a estadoAcademico del modelo
    if (condicion) {
      const estadoMap = {
        'activo': 'en_curso',
        'inactivo': 'suspendido', 
        'graduado': 'graduado'
      };
      updateData.estadoAcademico = estadoMap[condicion] || 'inscrito';
      // También guardamos condicion para compatibilidad
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

// @desc    Desactivar estudiante
// @route   DELETE /api/students/:id
// @access  Private (Admin)
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

// @desc    Reactivar estudiante
// @route   PATCH /api/students/:id/reactivate
// @access  Private (Admin)
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

// ==================== GESTIÓN DE PROFESORES ====================

// @desc    Listar todos los profesores con filtros
// @route   GET /api/teachers
// @access  Private (Admin)
const getTeachers = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      search, 
      status, 
      especialidad,
      disponible
    } = req.query;

    const filters = { role: 'profesor' };
    
    // Filtro por texto (nombre, apellido, email)
    if (search) {
      filters.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    // Filtro por estado/condición - considerar tanto isActive como condicion
    if (status) {
      console.log('getTeachers - Filtering by status:', status);
      if (status === 'activo') {
        // Un profesor está activo si isActive=true OR condicion='activo'
        filters.$and = filters.$and || [];
        filters.$and.push({
          $or: [
            { isActive: true },
            { condicion: 'activo' }
          ]
        });
      } else if (status === 'inactivo') {
        // Un profesor está inactivo si isActive=false AND condicion='inactivo' (o undefined)
        filters.$and = filters.$and || [];
        filters.$and.push({
          $and: [
            { isActive: false },
            { $or: [{ condicion: 'inactivo' }, { condicion: { $exists: false } }] }
          ]
        });
      }
    }

    // Filtro por especialidad
    if (especialidad) {
      filters.especialidades = { $in: [especialidad] };
    }

    // Filtro por disponibilidad
    if (disponible === 'true') {
      filters.disponible = true;
    } else if (disponible === 'false') {
      filters.disponible = false;
    }

    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
      sort: { createdAt: -1 },
      select: '-password'
    };

    console.log('getTeachers - Final filters:', JSON.stringify(filters, null, 2));

    const result = await userService.findUsers(filters, options);

    console.log('getTeachers - Results summary:', {
      total: result.totalDocs,
      returned: result.docs.length,
      sampleData: result.docs.slice(0, 2).map(doc => ({
        id: doc._id,
        name: `${doc.firstName} ${doc.lastName}`,
        condicion: doc.condicion,
        isActive: doc.isActive
      }))
    });

    res.json({
      success: true,
      message: 'Profesores obtenidos exitosamente',
      data: {
        teachers: result.docs,
        total: result.totalDocs, // Agregar total en el nivel data
        totalPages: result.totalPages, // Agregar totalPages en el nivel data
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
    console.error('Error en getTeachers:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      code: 'INTERNAL_ERROR'
    });
  }
};

// @desc    Obtener un profesor por ID
// @route   GET /api/teachers/:id
// @access  Private (Admin)
const getTeacherById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const teacher = await userService.findUserById(id);
    
    if (!teacher || teacher.role !== 'profesor') {
      return res.status(404).json({
        success: false,
        message: 'Profesor no encontrado',
        code: 'TEACHER_NOT_FOUND'
      });
    }

    res.json({
      success: true,
      message: 'Profesor obtenido exitosamente',
      data: {
        teacher: teacher.toJSON()
      }
    });

  } catch (error) {
    console.error('Error en getTeacherById:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      code: 'INTERNAL_ERROR'
    });
  }
};

// @desc    Actualizar profesor
// @route   PUT /api/teachers/:id
// @access  Private (Admin)
const updateTeacher = async (req, res) => {
  try {
    const validationError = handleValidationErrors(req, res);
    if (validationError) return validationError;

    const { id } = req.params;
    console.log('updateTeacher - ID:', id);
    console.log('updateTeacher - Request body:', JSON.stringify(req.body, null, 2));
    
    const { 
      firstName, 
      lastName, 
      email, 
      phone, 
      especialidades, 
      tarifaPorHora,
      disponibilidad,
      experiencia,
      isActive,
      disponible,
      condicion
    } = req.body;
    
    console.log('updateTeacher - Extracted especialidades:', especialidades);

    const teacher = await userService.findUserById(id);
    
    if (!teacher || teacher.role !== 'profesor') {
      return res.status(404).json({
        success: false,
        message: 'Profesor no encontrado',
        code: 'TEACHER_NOT_FOUND'
      });
    }

    const updateData = {};
    if (firstName) updateData.firstName = firstName;
    if (lastName) updateData.lastName = lastName;
    if (email) updateData.email = email;
    if (phone) updateData.phone = phone;
    if (especialidades) updateData.especialidades = especialidades;
    if (tarifaPorHora) updateData.tarifaPorHora = tarifaPorHora;
    if (disponibilidad) updateData.disponibilidad = disponibilidad;
    if (experiencia) updateData.experiencia = experiencia;
    if (typeof isActive === 'boolean') updateData.isActive = isActive;
    if (typeof disponible === 'boolean') updateData.disponible = disponible;
    if (condicion) updateData.condicion = condicion;

    console.log('updateTeacher - Final updateData:', JSON.stringify(updateData, null, 2));

    const updatedTeacher = await userService.updateUser(id, updateData);
    
    console.log('updateTeacher - Updated teacher from service:', JSON.stringify(updatedTeacher.toJSON(), null, 2));

    res.json({
      success: true,
      message: 'Profesor actualizado exitosamente',
      data: {
        teacher: updatedTeacher.toJSON()
      }
    });

  } catch (error) {
    console.error('Error en updateTeacher:', error);
    
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

// @desc    Desactivar profesor
// @route   DELETE /api/teachers/:id
// @access  Private (Admin)
const deactivateTeacher = async (req, res) => {
  try {
    const { id } = req.params;
    
    const teacher = await userService.findUserById(id);
    
    if (!teacher || teacher.role !== 'profesor') {
      return res.status(404).json({
        success: false,
        message: 'Profesor no encontrado',
        code: 'TEACHER_NOT_FOUND'
      });
    }

    const updatedTeacher = await userService.updateUser(id, { isActive: false });

    res.json({
      success: true,
      message: 'Profesor desactivado exitosamente',
      data: {
        teacher: updatedTeacher.toJSON()
      }
    });

  } catch (error) {
    console.error('Error en deactivateTeacher:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      code: 'INTERNAL_ERROR'
    });
  }
};

// @desc    Reactivar profesor
// @route   PATCH /api/teachers/:id/reactivate
// @access  Private (Admin)
const reactivateTeacher = async (req, res) => {
  try {
    const { id } = req.params;
    
    const teacher = await userService.findUserById(id);
    
    if (!teacher || teacher.role !== 'profesor') {
      return res.status(404).json({
        success: false,
        message: 'Profesor no encontrado',
        code: 'TEACHER_NOT_FOUND'
      });
    }

    const updatedTeacher = await userService.updateUser(id, { isActive: true });

    res.json({
      success: true,
      message: 'Profesor reactivado exitosamente',
      data: {
        teacher: updatedTeacher.toJSON()
      }
    });

  } catch (error) {
    console.error('Error en reactivateTeacher:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      code: 'INTERNAL_ERROR'
    });
  }
};

// ==================== FUNCIONES DE ESTADÍSTICAS ====================

// @desc    Obtener estadísticas de estudiantes
// @route   GET /api/students/stats
// @access  Private (Admin)
const getStudentsStats = async (req, res) => {
  try {
    const totalStudents = await userService.countUsers({ role: 'estudiante' });
    const activeStudents = await userService.countUsers({ role: 'estudiante', isActive: true });
    const inactiveStudents = await userService.countUsers({ role: 'estudiante', isActive: false });
    
    // Estadísticas por nivel
    const levelStats = await userService.getAggregateStats([
      { $match: { role: 'estudiante', isActive: true } },
      { $group: { _id: '$nivel', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    // Estadísticas por condición
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

// @desc    Obtener estadísticas de profesores
// @route   GET /api/teachers/stats
// @access  Private (Admin)
const getTeachersStats = async (req, res) => {
  try {
    console.log('getTeachersStats - Starting...');
    
    const totalTeachers = await userService.countUsers({ role: 'profesor' });
    console.log('getTeachersStats - Total teachers:', totalTeachers);
    
    // Usar isActive como campo principal ya que es el que tienen todos
    const activeTeachers = await userService.countUsers({ role: 'profesor', isActive: true });
    console.log('getTeachersStats - Active teachers (isActive):', activeTeachers);
    
    const inactiveTeachers = await userService.countUsers({ role: 'profesor', isActive: false });
    console.log('getTeachersStats - Inactive teachers (isActive):', inactiveTeachers);
    
    // Estadísticas por especialidad
    const specialtyStats = await userService.getAggregateStats([
      { $match: { role: 'profesor', isActive: true } },
      { $unwind: '$especialidades' },
      { $group: { _id: '$especialidades', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    res.json({
      success: true,
      message: 'Estadísticas de profesores obtenidas exitosamente',
      data: {
        overview: {
          total: totalTeachers,
          active: activeTeachers,
          inactive: inactiveTeachers
        },
        bySpecialty: specialtyStats
      }
    });

  } catch (error) {
    console.error('Error en getTeachersStats:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      code: 'INTERNAL_ERROR'
    });
  }
};

module.exports = {
  // Estudiantes
  getStudents,
  getStudentById,
  updateStudent,
  deactivateStudent,
  reactivateStudent,
  getStudentsStats,
  
  // Profesores
  getTeachers,
  getTeacherById,
  updateTeacher,
  deactivateTeacher,
  reactivateTeacher,
  getTeachersStats
};