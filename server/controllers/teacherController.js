const { validationResult } = require('express-validator');
const userService = require('../services/userService');

// function to handle validation errors
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

// all teacher-related controllers
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
    
    // filter by text (firstName, lastName, email)
    if (search) {
      filters.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    //filter by account status
    if (status) {
      if (status === 'activo') {
        
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

    // especialty filter
    if (especialidad) {
      filters.especialidades = { $in: [especialidad] };
    }

    // availability filter
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

    const result = await userService.findUsers(filters, options);

    res.json({
      success: true,
      message: 'Profesores obtenidos exitosamente',
      data: {
        teachers: result.docs,
        total: result.totalDocs, 
        totalPages: result.totalPages, 
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

// get teacher by ID
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
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'ID de profesor inválido',
        code: 'INVALID_ID'
      });
    }
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      code: 'INTERNAL_ERROR'
    });
  }
};

// update teacher

const updateTeacher = async (req, res) => {
  try {
    const validationError = handleValidationErrors(req, res);
    if (validationError) return validationError;

    const { id } = req.params;
    
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

    const updatedTeacher = await userService.updateUser(id, updateData);

    res.json({
      success: true,
      message: 'Profesor actualizado exitosamente',
      data: {
        teacher: updatedTeacher.toJSON()
      }
    });

  } catch (error) {
    console.error('Error en updateTeacher:', error);
    
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'ID de profesor inválido',
        code: 'INVALID_ID'
      });
    }
    
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Ya existe un usuario con este email',
        code: 'DUPLICATE_EMAIL'
      });
    }

    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(err => ({
        field: err.path,
        message: err.message
      }));
      return res.status(400).json({
        success: false,
        message: 'Errores de validación',
        errors: validationErrors
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      code: 'INTERNAL_ERROR'
    });
  }
};

// deactivate teacher

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

//    reactivate teacher

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

// get teachers statistics
const getTeachersStats = async (req, res) => {
  try {
    const totalTeachers = await userService.countUsers({ role: 'profesor' });
    
   
    const activeTeachers = await userService.countUsers({ role: 'profesor', isActive: true });
    
    const inactiveTeachers = await userService.countUsers({ role: 'profesor', isActive: false });
    
    // specialty statistics
    const specialtyStats = await userService.getAggregateStats([
      { $match: { role: 'profesor', isActive: true } },
      { $unwind: '$especialidades' },
      { $lookup: {
          from: 'languages',
          localField: 'especialidades',
          foreignField: '_id',
          as: 'languageInfo'
        }
      },
      { $unwind: '$languageInfo' },
      { $group: { 
          _id: {
            id: '$especialidades',
            name: '$languageInfo.name',
            code: '$languageInfo.code'
          }, 
          count: { $sum: 1 } 
        }
      },
      { $sort: { count: -1 } },
      { $project: {
          _id: '$_id.name',
          name: '$_id.name',
          code: '$_id.code',
          count: 1
        }
      }
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
  getTeachers,
  getTeacherById,
  updateTeacher,
  deactivateTeacher,
  reactivateTeacher,
  getTeachersStats
};