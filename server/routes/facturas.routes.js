const express = require('express');
const router = express.Router();
const facturaCtrl = require('../controllers/facturas.controller');
const { authenticateToken, requireAdmin} = require('../middlewares/auth.middleware');

// Ruta para crear una nueva factura

router.post('/', [authenticateToken, requireAdmin], facturaCtrl.createFactura);

module.exports = router;