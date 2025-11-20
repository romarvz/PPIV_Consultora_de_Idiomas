const { validationResult } = require('express-validator');
const jwt = require('jsonwebtoken');
const { BaseUser, Estudiante, Profesor, Admin, getUserModel, findUserByEmail, findUserById } = require('../models');

// auxiliary function to handle validation errors
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

// Function to generate JWT token
const generateToken = (userId) => {
  return jwt.sign(
    { id: userId },
    process.env.JWT_SECRET || 'mi_clave_secreta',
    { expiresIn: '24h' }
  );
};

// Function to validate registration permissions
const validateRegistrationPermissions = (role, authHeader) => {
  // Solo admins pueden registrar profesores y otros admins
  if (role === 'profesor' || role === 'admin') {
    if (!authHeader) {
      return {
        isValid: false,
        error: `Solo los administradores pueden crear ${role}s`,
        code: 'INSUFFICIENT_PERMISSIONS'
      };
    }
  }
  return { isValid: true };
};

//     Registro de usuario
const register = async (req, res) => {
  try {
    
    const validationError = handleValidationErrors(req, res);
    if (validationError) return validationError;

    const { 
      email, 
      password, 
      firstName, 
      lastName, 
      role = 'estudiante', 
      phone, 
      dni,
     
      nivel, 
      estadoAcademico,
      condicion,
      especialidades, 
      tarifaPorHora, 
      disponibilidad,
      horariosPermitidos,
      permisos
    } = req.body;

    // Capitalizar nombres y apellidos
    const { capitalizeUserNames } = require('../utils/stringHelpers');
    const capitalizedData = capitalizeUserNames({ firstName, lastName });
    const normalizedFirstName = capitalizedData.firstName;
    const normalizedLastName = capitalizedData.lastName;

  
    const existingUser = await findUserByEmail(email);
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Ya existe un usuario con este email',
        code: 'USER_EXISTS'
      });
    }

   
    if (dni) {
      const existingDni = await BaseUser.findOne({ dni });
      if (existingDni) {
        return res.status(400).json({
          success: false,
          message: 'Ya existe un usuario con este DNI',
          code: 'DNI_EXISTS'
        });
      }
    }

   
    const permissionCheck = validateRegistrationPermissions(role, req.header('Authorization'));
    if (!permissionCheck.isValid) {
      return res.status(403).json({
        success: false,
        message: permissionCheck.error,
        code: permissionCheck.code
      });
    }

    
    // Para estudiantes, mapear condicion a estadoAcademico y condicion válida
    let condicionFinal = condicion;
    let estadoAcademicoFinal = estadoAcademico;
    
    if (role === 'estudiante') {
      // Si viene condicion pero no estadoAcademico, mapear condicion a estadoAcademico
      if (condicion && !estadoAcademico) {
        const condicionToEstadoMap = {
          'inscrito': 'inscrito',
          'activo': 'en_curso',
          'en_curso': 'en_curso',
          'inactivo': 'suspendido',
          'suspendido': 'suspendido',
          'graduado': 'graduado'
        };
        estadoAcademicoFinal = condicionToEstadoMap[condicion] || 'inscrito';
      }
      
      // Mapear condicion a valores válidos para el enum de BaseUser
      // condicion solo acepta: 'activo', 'inactivo', 'graduado'
      if (condicion === 'inscrito' || condicion === 'en_curso') {
        condicionFinal = 'activo';
      } else if (condicion === 'suspendido') {
        condicionFinal = 'inactivo';
      } else if (condicion === 'graduado') {
        condicionFinal = 'graduado';
      } else if (!condicion || !['activo', 'inactivo', 'graduado'].includes(condicion)) {
        condicionFinal = 'activo'; // Valor por defecto válido
      }
      
      // Si no viene estadoAcademico, usar el valor por defecto
      if (!estadoAcademicoFinal) {
        estadoAcademicoFinal = 'inscrito';
      }
    } else {
      // Para otros roles, usar condicion directamente o 'activo' por defecto
      condicionFinal = condicion || 'activo';
    }

    const baseUserData = {
      email,
      password: password || dni, // for students, default password is dni
      firstName: normalizedFirstName,
      lastName: normalizedLastName,
      role,
      phone,
      dni,
      mustChangePassword: false,
      isActive: true,
      condicion: condicionFinal
    };

    // Create user based on role
    let newUser;
    
    switch (role) {
      case 'estudiante':
        newUser = new Estudiante({
          ...baseUserData,
          nivel,
          estadoAcademico: estadoAcademicoFinal
        });
        break;
        
      case 'profesor':
        newUser = new Profesor({
          ...baseUserData,
          especialidades,
          tarifaPorHora,
          disponibilidad,
          horariosPermitidos
        });
        break;
        
      case 'admin':
        newUser = new Admin({
          ...baseUserData,
          permisos: permisos || ['todos']
        });
        break;
        
      default:
        return res.status(400).json({
          success: false,
          message: 'Rol inválido',
          code: 'INVALID_ROLE'
        });
    }

    // Save the user
    await newUser.save();

    // Generate token
    const token = generateToken(newUser._id);

    res.status(201).json({
      success: true,
      message: 'Usuario registrado exitosamente',
      data: {
        token,
        user: newUser.toJSON()
      }
    });

  } catch (error) {
    console.error('Error en register:', error);
    
    
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      return res.status(400).json({
        success: false,
        message: `Ya existe un usuario con este ${field}`,
        code: 'DUPLICATE_KEY'
      });
    }

    // errors of mongoose validation
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

// Login of user
const login = async (req, res) => {
  try {
    const validationError = handleValidationErrors(req, res);
    if (validationError) return validationError;

    const { email, password } = req.body;

    // find user by email (la función ya normaliza el email)
    const user = await findUserByEmail(email);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Credenciales inválidas',
        code: 'INVALID_CREDENTIALS'
      });
    }

    // Check if user is active for login
    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Cuenta desactivada',
        code: 'ACCOUNT_DISABLED'
      });
    }

    // Check password
    const isPasswordCorrect = await user.comparePassword(password);
    if (!isPasswordCorrect) {
      return res.status(401).json({
        success: false,
        message: 'Credenciales inválidas',
        code: 'INVALID_CREDENTIALS'
      });
    }

    // Update last login (sin trigger del pre-save para evitar re-hashear password)
    await BaseUser.updateOne(
      { _id: user._id },
      { $set: { lastLogin: new Date() } }
    );

    // Generate token
    const token = generateToken(user._id);

    // Check if must change password
    if (user.mustChangePassword) {
      try {
        const userJSON = user.toJSON();
        return res.json({
          success: true,
          message: 'Debe cambiar su contraseña',
          mustChangePassword: true,
          data: {
            token,
            user: userJSON
          }
        });
      } catch (jsonError) {
        console.error('Error convirtiendo usuario a JSON (mustChangePassword):', jsonError);
        throw jsonError;
      }
    }

    try {
      const userJSON = user.toJSON();
      res.json({
        success: true,
        message: 'Login exitoso',
        data: {
          token,
          user: userJSON
        }
      });
    } catch (jsonError) {
      console.error('Error convirtiendo usuario a JSON:', jsonError);
      throw jsonError;
    }

  } catch (error) {
    console.error('Error en login:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      code: 'INTERNAL_ERROR',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

//    get user profile

const getProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await findUserById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado',
        code: 'USER_NOT_FOUND'
      });
    }

    res.json({
      success: true,
      data: {
        user: user.toJSON()
      }
    });

  } catch (error) {
    console.error('Error en getProfile:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      code: 'INTERNAL_ERROR'
    });
  }
};

// update user profile
const updateProfile = async (req, res) => {
  try {
    const validationError = handleValidationErrors(req, res);
    if (validationError) return validationError;

    const userId = req.user.id;
    const { firstName, lastName, phone } = req.body;

    const user = await findUserById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado',
        code: 'USER_NOT_FOUND'
      });
    }

    // Update allowed fields
    if (firstName) user.firstName = firstName;
    if (lastName) user.lastName = lastName;
    if (phone !== undefined) user.phone = phone;

    await user.save();

    res.json({
      success: true,
      message: 'Perfil actualizado exitosamente',
      data: {
        user: user.toJSON()
      }
    });

  } catch (error) {
    console.error('Error en updateProfile:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      code: 'INTERNAL_ERROR'
    });
  }
};

//    change password

const changePassword = async (req, res) => {
  try {
    const validationError = handleValidationErrors(req, res);
    if (validationError) return validationError;

    const userId = req.user.id;
    const { currentPassword, newPassword } = req.body;

    const user = await findUserById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado',
        code: 'USER_NOT_FOUND'
      });
    }

    // Check current password
    const isCurrentPasswordCorrect = await user.comparePassword(currentPassword);
    if (!isCurrentPasswordCorrect) {
      return res.status(400).json({
        success: false,
        message: 'Contraseña actual incorrecta',
        code: 'INCORRECT_PASSWORD'
      });
    }

    // Update password
    user.password = newPassword;
    user.mustChangePassword = false;
    await user.save();

    res.json({
      success: true,
      message: 'Contraseña actualizada exitosamente'
    });

  } catch (error) {
    console.error('Error en changePassword:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      code: 'INTERNAL_ERROR'
    });
  }
};

//   Change password forced (for users who must change it)

const changePasswordForced = async (req, res) => {
  try {
    const validationError = handleValidationErrors(req, res);
    if (validationError) return validationError;

    const userId = req.user.id;
    const { newPassword } = req.body;

    const user = await findUserById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado',
        code: 'USER_NOT_FOUND'
      });
    }

    // Check if must change password
    if (!user.mustChangePassword) {
      return res.status(400).json({
        success: false,
        message: 'No necesita cambiar la contraseña',
        code: 'PASSWORD_CHANGE_NOT_REQUIRED'
      });
    }

    // Update password
    user.password = newPassword;
    user.mustChangePassword = false;
    await user.save();

    res.json({
      success: true,
      message: 'Contraseña actualizada exitosamente'
    });

  } catch (error) {
    console.error('Error en changePasswordForced:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      code: 'INTERNAL_ERROR'
    });
  }
};

//  Logout

const logout = async (req, res) => {
  try {
    
    
    res.json({
      success: true,
      message: 'Logout exitoso'
    });

  } catch (error) {
    console.error('Error en logout:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      code: 'INTERNAL_ERROR'
    });
  }
};

// get students (for admin)

const getStudents = async (req, res) => {
  try {
    const { nivel, estadoAcademico, page = 1, limit = 10 } = req.query;

   
    const filters = { role: 'estudiante' };
    if (nivel) filters.nivel = nivel;
    if (estadoAcademico) filters.estadoAcademico = estadoAcademico;

    // Pagination
    const skip = (page - 1) * limit;

    // find students
    const students = await Estudiante.find(filters)
      .select('-password')
      .limit(limit * 1)
      .skip(skip)
      .sort({ createdAt: -1 });

    // Count total
    const total = await Estudiante.countDocuments(filters);

    res.json({
      success: true,
      data: {
        students,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
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

// get professors (for admin)


const getProfessors = async (req, res) => {
  try {
    const { especialidad, page = 1, limit = 10 } = req.query;

    // construct filters
    const filters = { role: 'profesor' };
    if (especialidad) {
      filters.especialidades = { $in: [especialidad] };
    }

    // Pagination
    const skip = (page - 1) * limit;

    // Count total first
    const total = await BaseUser.countDocuments(filters);
    
    // find professors - usar BaseUser para incluir todos los profesores
    // independientemente de cómo fueron creados (discriminador o no)
    const professors = await BaseUser.find(filters)
      .select('-password')
      .populate({
        path: 'especialidades',
        select: 'code name nativeName isActive',
        match: { isActive: { $ne: false } } // Solo incluir especialidades activas, pero no fallar si no hay
        // No usar strictPopulate para evitar errores si no hay especialidades
      })
      .limit(limit * 1)
      .skip(skip)
      .sort({ createdAt: -1 });
    
    // Log para debugging
    console.log(`[getProfessors] Filtros:`, JSON.stringify(filters));
    console.log(`[getProfessors] Encontrados ${professors.length} profesores de ${total} total`);

    res.json({
      success: true,
      data: {
        professors,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });

  } catch (error) {
    console.error('Error en getProfessors:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      code: 'INTERNAL_ERROR'
    });
  }
};

// update academic info (only for students)
const updateAcademicInfo = async (req, res) => {
  try {
    const validationError = handleValidationErrors(req, res);
    if (validationError) return validationError;

    const userId = req.user.id;
    const { nivel, estadoAcademico } = req.body;

    // find student
    const student = await Estudiante.findById(userId);
    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Estudiante no encontrado',
        code: 'STUDENT_NOT_FOUND'
      });
    }

    // verify role
    if (student.role !== 'estudiante') {
      return res.status(403).json({
        success: false,
        message: 'Solo los estudiantes pueden actualizar información académica',
        code: 'UNAUTHORIZED_ROLE'
      });
    }

    // Update fields
    if (nivel) student.nivel = nivel;
    if (estadoAcademico) student.estadoAcademico = estadoAcademico;

    await student.save();

    res.json({
      success: true,
      message: 'Información académica actualizada exitosamente',
      data: {
        user: student.toJSON()
      }
    });

  } catch (error) {
    console.error('Error en updateAcademicInfo:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      code: 'INTERNAL_ERROR'
    });
  }
};

// update teaching info (only for professors)

const updateTeachingInfo = async (req, res) => {
  try {
    const validationError = handleValidationErrors(req, res);
    if (validationError) return validationError;

    const userId = req.user.id;
    const { especialidades, tarifaPorHora, disponibilidad } = req.body;

    // find professor
    const professor = await Profesor.findById(userId);
    if (!professor) {
      return res.status(404).json({
        success: false,
        message: 'Profesor no encontrado',
        code: 'PROFESSOR_NOT_FOUND'
      });
    }

    // verify role
    if (professor.role !== 'profesor') {
      return res.status(403).json({
        success: false,
        message: 'Solo los profesores pueden actualizar información de enseñanza',
        code: 'UNAUTHORIZED_ROLE'
      });
    }

    // Update fields
    if (especialidades) professor.especialidades = especialidades;
    if (tarifaPorHora !== undefined) professor.tarifaPorHora = tarifaPorHora;
    if (disponibilidad) professor.disponibilidad = disponibilidad;

    await professor.save();

    res.json({
      success: true,
      message: 'Información de enseñanza actualizada exitosamente',
      data: {
        user: professor.toJSON()
      }
    });

  } catch (error) {
    console.error('Error en updateTeachingInfo:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      code: 'INTERNAL_ERROR'
    });
  }
};

//  (soft delete)

const deactivateUser = async (req, res) => {
  try {
    const { id } = req.params;

    // veerify that is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Solo los administradores pueden desactivar usuarios',
        code: 'INSUFFICIENT_PERMISSIONS'
      });
    }

    
    const user = await findUserById(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado',
        code: 'USER_NOT_FOUND'
      });
    }

    // Validate that cannot deactivate self
    if (user._id.toString() === req.user.id) {
      return res.status(400).json({
        success: false,
        message: 'No puedes desactivar tu propia cuenta',
        code: 'SELF_DEACTIVATION_FORBIDDEN'
      });
    }

    // Validate that only students and professors can be deactivated
    if (user.role === 'admin') {
      return res.status(400).json({
        success: false,
        message: 'No se pueden desactivar otros administradores',
        code: 'ADMIN_DEACTIVATION_FORBIDDEN'
      });
    }

    // deactivate user
    user.isActive = false;
    await user.save();

    res.json({
      success: true,
      message: `${user.role.charAt(0).toUpperCase() + user.role.slice(1)} desactivado exitosamente`,
      data: {
        user: {
          _id: user._id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          isActive: user.isActive
        }
      }
    });

  } catch (error) {
    console.error('Error en deactivateUser:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      code: 'INTERNAL_ERROR'
    });
  }
};

//     reactivate user (soft undelete)

const reactivateUser = async (req, res) => {
  try {
    const { id } = req.params;

    // verify that is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Solo los administradores pueden reactivar usuarios',
        code: 'INSUFFICIENT_PERMISSIONS'
      });
    }

    
    const user = await findUserById(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado',
        code: 'USER_NOT_FOUND'
      });
    }

    // Reactivate user
    user.isActive = true;
    await user.save();

    res.json({
      success: true,
      message: `${user.role.charAt(0).toUpperCase() + user.role.slice(1)} reactivado exitosamente`,
      data: {
        user: {
          _id: user._id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          isActive: user.isActive
        }
      }
    });

  } catch (error) {
    console.error('Error en reactivateUser:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      code: 'INTERNAL_ERROR'
    });
  }
};

// delete user (hard delete)
const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    // Verify that is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Solo los administradores pueden eliminar usuarios',
        code: 'INSUFFICIENT_PERMISSIONS'
      });
    }

    // Find user
    const user = await findUserById(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado',
        code: 'USER_NOT_FOUND'
      });
    }

    // Validate that cannot delete self
    if (user._id.toString() === req.user.id) {
      return res.status(400).json({
        success: false,
        message: 'No puedes eliminar tu propia cuenta',
        code: 'SELF_DELETION_FORBIDDEN'
      });
    }

    // Validate that only students and professors can be deleted
    if (user.role === 'admin') {
      return res.status(400).json({
        success: false,
        message: 'No se pueden eliminar otros administradores',
        code: 'ADMIN_DELETION_FORBIDDEN'
      });
    }

    // Save user information before deletion
    const deletedUserInfo = {
      _id: user._id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role
    };

    // delete user
    await BaseUser.findByIdAndDelete(id);

    res.json({
      success: true,
      message: `${user.role.charAt(0).toUpperCase() + user.role.slice(1)} eliminado permanentemente`,
      data: {
        deletedUser: deletedUserInfo
      }
    });

  } catch (error) {
    console.error('Error en deleteUser:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      code: 'INTERNAL_ERROR'
    });
  }
};

module.exports = {
  register,
  login,
  getProfile,
  updateProfile,
  changePassword,
  changePasswordForced,
  logout,
  getStudents,
  getProfessors,
  updateAcademicInfo,
  updateTeachingInfo,
  deactivateUser,
  reactivateUser,
  deleteUser
};