const express = require('express');
const router = express.Router();
const cobroCtrl = require('../controllers/cobros.controller');
const { authenticateToken, requireAdmin } = require('../middleware/authMiddlewareNew');

// Ruta para que un estudiante registre su propio pago
router.post('/mi-pago',
    authenticateToken,
    cobroCtrl.registrarMiPago);

// Ruta para obtener mis propios cobros (estudiante autenticado)
router.get('/mis-cobros',
    authenticateToken,
    cobroCtrl.getMisCobros);

// Ruta para obtener un cobro específico por ID (estudiante puede ver sus propios cobros)
router.get('/:id',
    authenticateToken,
    cobroCtrl.getCobroById);

// Ruta para crear un nuevo cobro (soporta una o múltiples facturas) - ADMIN
router.post('/',
    [authenticateToken, requireAdmin],
    cobroCtrl.createCobro);

// Ruta para listar todos los cobros (con filtros opcionales) - ADMIN
router.get('/',
    [authenticateToken, requireAdmin],
    cobroCtrl.listarCobros);

// Ruta para obtener todos los cobros de un estudiante
router.get('/estudiante/:idEstudiante',
    [authenticateToken, requireAdmin],
    cobroCtrl.getCobrosByEstudiante);

// Ruta para obtener todos los cobros de una factura específica
router.get('/factura/:idFactura',
    [authenticateToken, requireAdmin],
    cobroCtrl.getCobrosByFactura);

module.exports = router;