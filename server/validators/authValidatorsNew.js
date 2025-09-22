const { body } = require('express-validator');

// ==================== VALIDACIONES BASE ====================

const baseUserValidation = [
  body('email')
    .isEmail()
    .withMessage('Debe ser un email válido')
    .normalizeEmail()
    .toLowerCase(),
  
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
  
  body('phone')
    .optional()
    .custom((value) => {
      if (!value) return true;
      const phoneRegex = /^[\+]?[0-9\s\-\(\)]{8,15}$/;
      if (!phoneRegex.test(value)) {
        throw new Error('Teléfono debe tener entre 8 y 15 dígitos');
      }
      return true;
    })
];

const passwordValidation = [
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
    })
];

const dniValidation = [
  body('dni')
    .trim()
    .isNumeric()
    .withMessage('DNI debe contener solo números')
    .isLength({ min: 7, max: 8 })
    .withMessage('DNI debe tener entre 7 y 8 dígitos')
];

// ==================== VALIDACIONES ESPECÍFICAS POR TIPO ====================

// Validaciones para estudiantes
const estudianteSpecificValidation = [
  body('nivel')
    .isIn(['A1', 'A2', 'B1', 'B2', 'C1', 'C2'])
    .withMessage('Nivel debe ser: A1, A2, B1, B2, C1 o C2'),
  
  body('estadoAcademico')
    .optional()
    .isIn(['inscrito', 'en_curso', 'graduado', 'suspendido'])
    .withMessage('Estado académico debe ser: inscrito, en_curso, graduado o suspendido')
];

// Validaciones para profesores
const profesorSpecificValidation = [
  body('especialidades')
    .isArray({ min: 1 })
    .withMessage('Debe seleccionar al menos una especialidad'),
    
  body('especialidades.*')
    .isIn(['ingles', 'frances', 'aleman', 'italiano', 'portugues', 'espanol'])
    .withMessage('Especialidad inválida'),
    
  body('tarifaPorHora')
    .isFloat({ min: 0 })
    .withMessage('La tarifa por hora debe ser un número mayor o igual a 0'),
    
  body('disponibilidad')
    .optional()
    .isObject()
    .withMessage('Disponibilidad debe ser un objeto válido')
];

// Validaciones para administradores
const adminSpecificValidation = [
  body('permisos')
    .optional()
    .isArray()
    .withMessage('Permisos debe ser un array'),
    
  body('permisos.*')
    .optional()
    .isIn(['gestion_usuarios', 'reportes', 'configuracion', 'todos'])
    .withMessage('Permiso inválido')
];

// ==================== VALIDACIONES PARA REGISTRO ====================

const validateRegisterEstudiante = [
  ...baseUserValidation,
  ...passwordValidation,
  ...dniValidation,
  ...estudianteSpecificValidation,
  body('role').equals('estudiante').withMessage('Role debe ser estudiante')
];

const validateRegisterProfesor = [
  ...baseUserValidation,
  ...passwordValidation,
  ...dniValidation,
  ...profesorSpecificValidation,
  body('role').equals('profesor').withMessage('Role debe ser profesor')
];

const validateRegisterAdmin = [
  ...baseUserValidation,
  ...passwordValidation,
  ...adminSpecificValidation,
  body('role').equals('admin').withMessage('Role debe ser admin'),
  body('dni')
    .optional()
    .trim()
    .isNumeric()
    .withMessage('DNI debe contener solo números')
    .isLength({ min: 7, max: 8 })
    .withMessage('DNI debe tener entre 7 y 8 dígitos')
];

// ==================== VALIDACIONES PARA REGISTRO DESDE ADMIN ====================

const validateRegisterEstudianteFromAdmin = [
  ...baseUserValidation,
  ...dniValidation,
  ...estudianteSpecificValidation,
  body('role').equals('estudiante').withMessage('Role debe ser estudiante')
];

const validateRegisterProfesorFromAdmin = [
  ...baseUserValidation,
  ...dniValidation,
  ...profesorSpecificValidation,
  body('role').equals('profesor').withMessage('Role debe ser profesor')
];

// ==================== OTRAS VALIDACIONES ====================

const validateLogin = [
  body('email')
    .isEmail()
    .withMessage('Debe ser un email válido')
    .normalizeEmail(),
  
  body('password')
    .notEmpty()
    .withMessage('Password es requerido')
];

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
        throw new Error('Teléfono debe tener entre 8 y 15 dígitos');
      }
      return true;
    })
];

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

const validateChangePasswordForced = [
  body('newPassword')
    .isLength({ min: 6 })
    .withMessage('Nuevo password debe tener al menos 6 caracteres')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Nuevo password debe contener al menos: 1 minúscula, 1 mayúscula, 1 número')
];

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

// ==================== FUNCIÓN HELPER ====================

// Función para obtener las validaciones correctas según el rol
const getValidationForRole = (role, isFromAdmin = false) => {
  if (isFromAdmin) {
    switch(role) {
      case 'estudiante':
        return validateRegisterEstudianteFromAdmin;
      case 'profesor':
        return validateRegisterProfesorFromAdmin;
      case 'admin':
        return validateRegisterAdmin;
      default:
        return baseUserValidation;
    }
  } else {
    switch(role) {
      case 'estudiante':
        return validateRegisterEstudiante;
      case 'profesor':
        return validateRegisterProfesor;
      case 'admin':
        return validateRegisterAdmin;
      default:
        return baseUserValidation;
    }
  }
};

module.exports = {
  // Validaciones por tipo
  validateRegisterEstudiante,
  validateRegisterProfesor,
  validateRegisterAdmin,
  validateRegisterEstudianteFromAdmin,
  validateRegisterProfesorFromAdmin,
  
  // Validaciones generales
  validateLogin,
  validateUpdateProfile,
  validateChangePassword,
  validateChangePasswordForced,
  validateUpdateAcademicInfo,
  validateUpdateTeachingInfo,
  
  // Helper function
  getValidationForRole,
  
  // Validaciones base para reutilizar
  baseUserValidation,
  passwordValidation,
  dniValidation
};