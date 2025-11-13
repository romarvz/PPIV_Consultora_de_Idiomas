const express = require('express');
const router = express.Router();
const facturaCtrl = require('../controllers/facturas.controller');
const { authenticateToken, requireAdmin} = require('../middleware/authMiddlewareNew');
const {validateCrearFactura, validateMongoId} = require('../middleware/financiero.validation');

// ========================================
// RUTAS DE FACTURAS CON FLUJO BORRADOR
// ========================================

/**
 * Crear una nueva factura en BORRADOR (sin autorización)
 * POST /api/facturas
 * 
 * La factura se crea sin CAE y puede ser editada o eliminada
 */
router.post('/', 
    [authenticateToken, requireAdmin, validateCrearFactura], 
    facturaCtrl.createFactura
);

/**
 * Obtener una factura por ID
 * GET /api/facturas/:id
 */
router.get('/:id',
    [authenticateToken],
    facturaCtrl.getFacturaById
);

/**
 * Editar una factura en BORRADOR
 * PUT /api/facturas/:id
 * 
 * Solo se pueden editar facturas en estado "Borrador"
 */
router.put('/:id',
    [authenticateToken, requireAdmin],
    facturaCtrl.editarFactura
);

/**
 * Eliminar una factura en BORRADOR
 * DELETE /api/facturas/:id
 * 
 * Solo se pueden eliminar facturas en estado "Borrador"
 */
router.delete('/:id',
    [authenticateToken, requireAdmin],
    facturaCtrl.eliminarFactura
);

/**
 * Autorizar una factura (solicitar CAE a AFIP)
 * PUT /api/facturas/:id/autorizar
 * 
 * Solicita CAE a AFIP y cambia el estado de "Borrador" a "Pendiente"
 * Después de autorizar, la factura NO puede ser editada ni eliminada
 */
router.put('/:id/autorizar',
    [authenticateToken, requireAdmin],
    facturaCtrl.autorizarFactura
);

// ========================================
// RUTAS DE CONSULTA
// ========================================

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

/**
 * Verificar estado del servicio AFIP
 * GET /api/facturas/afip/estado
 */
router.get('/afip/estado',
    [authenticateToken, requireAdmin],
    facturaCtrl.verificarEstadoAFIP
);

module.exports = router;