const express = require('express');
const router = express.Router();
const facturaCtrl = require('../controllers/facturas.controller');
const { authenticateToken, requireAdmin} = require('../middleware/authMiddlewareNew');

// Ruta para crear una nueva factura
router.post('/', [authenticateToken, requireAdmin], facturaCtrl.createFactura);

// Ruta para obtener facturas de un estudiante
router.get('/estudiante/:idEstudiante', authenticateToken, facturaCtrl.getFacturasByEstudiante);

// Ruta para obtener deuda de un estudiante
router.get('/estudiante/:idEstudiante/deuda', authenticateToken, facturaCtrl.getDeudaEstudiante);

module.exports = router;