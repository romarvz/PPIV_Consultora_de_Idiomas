const express = require('express');
const router = express.Router();
const cobroCtrl = require('../controllers/cobros.controller');
const { authenticateToken, requireAdmin } = require('../middleware/authMiddlewareNew');
const { validateCrearCobro, validateMongoId } = require('../middleware/financiero.validation');
const { validate } = require('../models/cobros.model');

// Ruta para crear un nuevo cobro
router.post('/', 
    [authenticateToken, requireAdmin, validateCrearCobro], 
    cobroCtrl.createCobro);

// Ruta para obtener todos los cobros de un estudiante  
router.get('/estudiante/:idEstudiante', 
    [authenticateToken, requireAdmin, validateMongoId], 
    cobroCtrl.getCobrosByEstudiante);

module.exports = router;