const express = require('express');
const router = express.Router();
const facturaCtrl = require('../controllers/facturas.controller');
const { authenticateToken, requireAdmin} = require('../middleware/authMiddlewareNew');
const {validateCrearFactura, validateMongoId} = require('../middleware/financiero.validation');

// Ruta para obtener todas las facturas
router.get('/', 
    [authenticateToken], 
    facturaCtrl.getAllFacturas);

// Ruta para crear una nueva factura
router.post('/', 
    [authenticateToken, requireAdmin, validateCrearFactura], 
    facturaCtrl.createFactura);

// Ruta para autorizar una factura
router.put('/:id/autorizar', 
    [authenticateToken, requireAdmin], 
    facturaCtrl.autorizarFactura);

// Ruta para obtener facturas de un estudiante
router.get('/estudiante/:idEstudiante', 
    [authenticateToken, validateMongoId], 
    facturaCtrl.getFacturasByEstudiante);

// Ruta para obtener deuda de un estudiante
router.get('/estudiante/:idEstudiante/deuda', 
    [authenticateToken, validateMongoId], 
    facturaCtrl.getDeudaEstudiante);

module.exports = router;