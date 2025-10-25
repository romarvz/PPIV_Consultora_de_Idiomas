const express = require('express');
const router = express.Router();
const facturaCtrl = require('../controllers/facturas.controller');
const { verifyToken, isAdmin } = require('../middlewares/auth.middleware');

// Ruta para crear una nueva factura

router.post('/', [verifyToken, isAdmin], facturaCtrl.createFactura);

module.exports = router;