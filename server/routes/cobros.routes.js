const express = require('express');
const router = express.Router();
const cobroCtrl = require('../controllers/cobros.controller');
const { authenticateToken, requireAdmin } = require('../middleware/authMiddlewareNew');

// Ruta para crear un nuevo cobro (soporta una o múltiples facturas)
router.post('/', 
    [authenticateToken, requireAdmin], 
    cobroCtrl.createCobro);

// Ruta para listar todos los cobros (con filtros opcionales)
router.get('/', 
    [authenticateToken, requireAdmin], 
    cobroCtrl.listarCobros);

// Ruta para obtener mis propios cobros (estudiante autenticado)
router.get('/mis-cobros',
    authenticateToken,
    cobroCtrl.getMisCobros);

// Ruta para obtener todos los cobros de un estudiante
router.get('/estudiante/:idEstudiante',
    [authenticateToken, requireAdmin],
    cobroCtrl.getCobrosByEstudiante);

// Ruta para obtener todos los cobros de una factura específica
router.get('/factura/:idFactura',
    [authenticateToken, requireAdmin],
    cobroCtrl.getCobrosByFactura);

module.exports = router;