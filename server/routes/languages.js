const express = require('express');
const router = express.Router();

// Importar controlador de idiomas
const {
  getLanguages,
  getLanguageById,
  getLanguageByCode,
  createLanguage,
  updateLanguage,
  toggleLanguageStatus,
  deleteLanguage,
  getLanguageStats
} = require('../controllers/languageController');

// Importar middlewares
const { 
  authenticateToken, 
  requireAdmin 
} = require('../middleware/authMiddlewareNew');

// Importar validadores
const { body, param } = require('express-validator');

// ==================== VALIDADORES ====================

const validateLanguageCreate = [
  body('code')
    .isLength({ min: 2, max: 5 })
    .withMessage('El código debe tener entre 2 y 5 caracteres')
    .matches(/^[a-z0-9]+$/)
    .withMessage('El código solo puede contener letras minúsculas y números'),
    
  body('name')
    .isLength({ min: 2, max: 50 })
    .withMessage('El nombre debe tener entre 2 y 50 caracteres')
    .trim(),
    
  body('nativeName')
    .optional()
    .isLength({ max: 50 })
    .withMessage('El nombre nativo no puede exceder 50 caracteres')
    .trim(),
    
  body('description')
    .optional()
    .isLength({ max: 200 })
    .withMessage('La descripción no puede exceder 200 caracteres')
    .trim(),
    
  body('level')
    .optional()
    .isIn(['basico', 'intermedio', 'avanzado', 'nativo'])
    .withMessage('El nivel debe ser: basico, intermedio, avanzado o nativo'),
    
  body('demandLevel')
    .optional()
    .isIn(['bajo', 'medio', 'alto'])
    .withMessage('El nivel de demanda debe ser: bajo, medio o alto')
];

const validateLanguageUpdate = [
  body('code')
    .optional()
    .isLength({ min: 2, max: 5 })
    .withMessage('El código debe tener entre 2 y 5 caracteres')
    .matches(/^[a-z0-9]+$/)
    .withMessage('El código solo puede contener letras minúsculas y números'),
    
  body('name')
    .optional()
    .isLength({ min: 2, max: 50 })
    .withMessage('El nombre debe tener entre 2 y 50 caracteres')
    .trim(),
    
  body('nativeName')
    .optional()
    .isLength({ max: 50 })
    .withMessage('El nombre nativo no puede exceder 50 caracteres')
    .trim(),
    
  body('description')
    .optional()
    .isLength({ max: 200 })
    .withMessage('La descripción no puede exceder 200 caracteres')
    .trim(),
    
  body('level')
    .optional()
    .isIn(['basico', 'intermedio', 'avanzado', 'nativo'])
    .withMessage('El nivel debe ser: basico, intermedio, avanzado o nativo'),
    
  body('demandLevel')
    .optional()
    .isIn(['bajo', 'medio', 'alto'])
    .withMessage('El nivel de demanda debe ser: bajo, medio o alto'),
    
  body('isActive')
    .optional()
    .isBoolean()
    .withMessage('isActive debe ser un valor booleano')
];

const validateId = [
  param('id')
    .isMongoId()
    .withMessage('ID no válido')
];

const validateCode = [
  param('code')
    .isLength({ min: 2, max: 5 })
    .withMessage('Código debe tener entre 2 y 5 caracteres')
    .matches(/^[a-z0-9]+$/)
    .withMessage('Código debe contener solo letras minúsculas y números')
];

// ==================== RUTAS PÚBLICAS ====================

// Obtener todos los idiomas (público para que profesores vean opciones)
router.get('/', getLanguages);

// Obtener idioma por código (público)
router.get('/code/:code', validateCode, getLanguageByCode);

// Obtener idioma por ID (público)
router.get('/:id', validateId, getLanguageById);

// ==================== RUTAS PRIVADAS (ADMIN) ====================

// Estadísticas de idiomas
router.get('/admin/stats', 
  authenticateToken, 
  requireAdmin, 
  getLanguageStats
);

// Crear nuevo idioma
router.post('/', 
  authenticateToken, 
  requireAdmin, 
  validateLanguageCreate,
  createLanguage
);

// Actualizar idioma
router.put('/:id', 
  authenticateToken, 
  requireAdmin, 
  validateId,
  validateLanguageUpdate,
  updateLanguage
);

// Activar/Desactivar idioma
router.patch('/:id/toggle', 
  authenticateToken, 
  requireAdmin, 
  validateId,
  toggleLanguageStatus
);

// Eliminar idioma (soft delete)
router.delete('/:id', 
  authenticateToken, 
  requireAdmin, 
  validateId,
  deleteLanguage
);

// ==================== RUTAS DE UTILIDAD ====================

// Test de conectividad
router.get('/test/ping', (req, res) => {
  res.json({
    success: true,
    message: 'Language routes working correctly',
    timestamp: new Date().toISOString(),
    endpoints: {
      public: [
        'GET /api/languages - Obtener todos los idiomas',
        'GET /api/languages/:id - Obtener idioma por ID',
        'GET /api/languages/code/:code - Obtener idioma por código'
      ],
      admin: [
        'POST /api/languages - Crear idioma',
        'PUT /api/languages/:id - Actualizar idioma',
        'PATCH /api/languages/:id/toggle - Activar/desactivar',
        'DELETE /api/languages/:id - Eliminar idioma',
        'GET /api/languages/admin/stats - Estadísticas'
      ]
    }
  });
});

module.exports = router;