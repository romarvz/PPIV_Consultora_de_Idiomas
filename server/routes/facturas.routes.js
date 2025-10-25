const express = require('express');
const router = express.Router();
const facturaCtrl = require('../controllers/facturas.controller');

// Ruta para crear una nueva factura
router.post('/', facturaCtrl.createFactura);

module.exports = router;