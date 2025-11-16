const express = require('express');
const router = express.Router();
const facturaCtrl = require('../controllers/facturas.controller');
const { authenticateToken, requireAdmin } = require('../middleware/authMiddlewareNew');
const { validateCrearFactura, validateMongoId } = require('../middleware/financiero.validation');

// ========================================
// RUTAS DE GESTIÓN DE FACTURAS
// ========================================

/**
 * Obtener todas las facturas
 * GET /api/facturas
 */
router.get('/', 
    [authenticateToken], 
    facturaCtrl.getAllFacturas
);

/**
 * Crear una nueva factura en BORRADOR (sin autorización)
 * POST /api/facturas
 */
router.post('/', 
    [authenticateToken, requireAdmin, validateCrearFactura], 
    facturaCtrl.createFactura
);

/**
 * Obtener una factura por ID
 * GET /api/facturas/:id
 * IMPORTANTE: Esta ruta DEBE ir ANTES de las rutas con parámetros específicos
 */
router.get('/:id',
    [authenticateToken],
    facturaCtrl.getFacturaById
);

/**
 * Editar una factura en BORRADOR
 * PUT /api/facturas/:id
 */
router.put('/:id',
    [authenticateToken, requireAdmin],
    facturaCtrl.editarFactura
);

/**
 * Eliminar una factura en BORRADOR
 * DELETE /api/facturas/:id
 */
router.delete('/:id',
    [authenticateToken, requireAdmin],
    facturaCtrl.eliminarFactura
);

/**
 * Autorizar una factura (solicitar CAE a AFIP)
 * PUT /api/facturas/:id/autorizar
 */
router.put('/:id/autorizar',
    [authenticateToken, requireAdmin],
    facturaCtrl.autorizarFactura
);

// ========================================
// RUTAS DE CONSULTA POR ESTUDIANTE
// ========================================

/**
 * Obtener mis propias facturas (estudiante autenticado)
 * GET /api/facturas/mis-facturas
 */
router.get('/mis-facturas',
    authenticateToken,
    facturaCtrl.getMisFacturas
);

/**
 * Obtener facturas de un estudiante
 * GET /api/facturas/estudiante/:idEstudiante
 */
router.get('/estudiante/:idEstudiante',
    [authenticateToken, validateMongoId],
    facturaCtrl.getFacturasByEstudiante
);

/**
 * Obtener deuda de un estudiante
 * GET /api/facturas/estudiante/:idEstudiante/deuda
 */
router.get('/estudiante/:idEstudiante/deuda', 
    [authenticateToken, validateMongoId], 
    facturaCtrl.getDeudaEstudiante
);

// ========================================
// RUTAS DE ESTADO DEL SERVICIO
// ========================================

/**
 * Verificar estado del servicio AFIP
 * GET /api/facturas/afip/estado
 */
router.get('/afip/estado',
    [authenticateToken, requireAdmin],
    facturaCtrl.verificarEstadoAFIP
);

module.exports = router;