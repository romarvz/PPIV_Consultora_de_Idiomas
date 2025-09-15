const { body } = require('express-validator');

// Validaciones para registro
const validateRegister = [
  body('email')
    .isEmail()
    .withMessage('Debe ser un email válido')
    .normalizeEmail()
    .toLowerCase(),
  
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password debe tener al menos 6 caracteres')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password debe contener al menos: 1 minúscula, 1 mayúscula, 1 número'),
  
  body('confirmPassword')
    .custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error('Las contraseñas no coinciden');
      }
      return true;
    }),
  
  body('firstName')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Nombre debe tener entre 2 y 50 caracteres')
    .matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/)
    .withMessage('Nombre solo puede contener letras y espacios'),
  
  body('lastName')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Apellido debe tener entre 2 y 50 caracteres')
    .matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/)
    .withMessage('Apellido solo puede contener letras y espacios'),
  
  body('role')
    .optional()
    .isIn(['admin', 'profesor', 'estudiante'])
    .withMessage('Rol debe ser: admin, profesor o estudiante'),
  
  body('phone')
    .optional()
    .custom((value) => {
      if (!value) return true; // Si está vacío, está bien
      // Permitir formatos más flexibles
      const phoneRegex = /^[\+]?[0-9\s\-\(\)]{8,15}$/;
      if (!phoneRegex.test(value)) {
        throw new Error('Número de teléfono inválido. Use entre 8-15 dígitos');
      }
      return true;
    }),
  
  // Validaciones específicas para ESTUDIANTES
  body('nivel')
    .if(body('role').equals('estudiante'))
    .isIn(['A1', 'A2', 'B1', 'B2', 'C1', 'C2'])
    .withMessage('Nivel debe ser: A1, A2, B1, B2, C1 o C2'),
    
  body('estadoAcademico')
    .if(body('role').equals('estudiante'))
    .optional()
    .isIn(['inscrito', 'en_curso', 'graduado', 'suspendido'])
    .withMessage('Estado académico debe ser: inscrito, en_curso, graduado o suspendido'),
  
  // Validaciones específicas para PROFESORES
  body('especialidades')
    .if(body('role').equals('profesor'))
    .isArray({ min: 1 })
    .withMessage('Debe seleccionar al menos una especialidad'),
    
  body('especialidades.*')
    .if(body('role').equals('profesor'))
    .isIn(['ingles', 'frances', 'aleman', 'italiano', 'portugues', 'espanol'])
    .withMessage('Especialidad inválida'),
    
  body('tarifaPorHora')
    .if(body('role').equals('profesor'))
    .isFloat({ min: 0 })
    .withMessage('La tarifa por hora debe ser un número mayor o igual a 0'),
    
  body('disponibilidad')
    .if(body('role').equals('profesor'))
    .optional()
    .isObject()
    .withMessage('Disponibilidad debe ser un objeto válido')
];

// Validaciones para login
const validateLogin = [
  body('email')
    .isEmail()
    .withMessage('Debe ser un email válido')
    .normalizeEmail()
    .toLowerCase(),
  
  body('password')
    .notEmpty()
    .withMessage('Password es requerido')
];

// Validaciones para actualizar perfil
const validateUpdateProfile = [
  body('firstName')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Nombre debe tener entre 2 y 50 caracteres')
    .matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/)
    .withMessage('Nombre solo puede contener letras y espacios'),
  
  body('lastName')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Apellido debe tener entre 2 y 50 caracteres')
    .matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/)
    .withMessage('Apellido solo puede contener letras y espacios'),
  
  body('phone')
    .optional()
    .custom((value) => {
      if (!value) return true;
      const phoneRegex = /^[\+]?[0-9\s\-\(\)]{8,15}$/;
      if (!phoneRegex.test(value)) {
        throw new Error('Número de teléfono inválido. Use entre 8-15 dígitos');
      }
      return true;
    })
];

// Validaciones para cambio de contraseña
const validateChangePassword = [
  body('currentPassword')
    .notEmpty()
    .withMessage('Password actual es requerido'),
  
  body('newPassword')
    .isLength({ min: 6 })
    .withMessage('Nuevo password debe tener al menos 6 caracteres')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Nuevo password debe contener al menos: 1 minúscula, 1 mayúscula, 1 número'),
  
  body('confirmPassword')
    .custom((value, { req }) => {
      if (value !== req.body.newPassword) {
        throw new Error('Las contraseñas no coinciden');
      }
      return true;
    })
];

// Validaciones para actualizar información académica (estudiantes)
const validateUpdateAcademicInfo = [
  body('nivel')
    .optional()
    .isIn(['A1', 'A2', 'B1', 'B2', 'C1', 'C2'])
    .withMessage('Nivel debe ser: A1, A2, B1, B2, C1 o C2'),
    
  body('estadoAcademico')
    .optional()
    .isIn(['inscrito', 'en_curso', 'graduado', 'suspendido'])
    .withMessage('Estado académico debe ser: inscrito, en_curso, graduado o suspendido')
];

// Validaciones para actualizar información de enseñanza (profesores)
const validateUpdateTeachingInfo = [
  body('especialidades')
    .optional()
    .isArray({ min: 1 })
    .withMessage('Debe seleccionar al menos una especialidad'),
    
  body('especialidades.*')
    .optional()
    .isIn(['ingles', 'frances', 'aleman', 'italiano', 'portugues', 'espanol'])
    .withMessage('Especialidad inválida'),
    
  body('tarifaPorHora')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('La tarifa por hora debe ser un número mayor o igual a 0'),
    
  body('disponibilidad')
    .optional()
    .isObject()
    .withMessage('Disponibilidad debe ser un objeto válido')
];

module.exports = {
  validateRegister,
  validateLogin,
  validateUpdateProfile,
  validateChangePassword,
  validateUpdateAcademicInfo,
  validateUpdateTeachingInfo
};