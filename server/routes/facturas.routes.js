const express = require('express');
const router = express.Router();
const facturaCtrl = require('../controllers/facturas.controller');
const { authenticateToken, requireAdmin} = require('../middleware/authMiddlewareNew');
const {validateCrearFactura, validateMongoId} = require('../middleware/financiero.validation');

// Ruta para crear una nueva factura
router.post('/', 
    [authenticateToken, requireAdmin, validateCrearFactura], 
    facturaCtrl.createFactura);

// Ruta para obtener facturas de un estudiante
router.get('/estudiante/:idEstudiante', 
    [authenticateToken, validateMongoId], 
    facturaCtrl.getFacturasByEstudiante);

// Ruta para obtener deuda de un estudiante
router.get('/estudiante/:idEstudiante/deuda', 
    [authenticateToken, validateMongoId], 
    facturaCtrl.getDeudaEstudiante);

module.exports = router;