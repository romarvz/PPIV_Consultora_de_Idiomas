const express = require('express');
const router = express.Router();
const cobroCtrl = require('../controllers/cobros.controller');
const { authenticateToken, requireAdmin } = require('../middleware/authMiddlewareNew');

// Ruta para crear un nuevo cobro
router.post('/', [authenticateToken, requireAdmin], cobroCtrl.createCobro);

// Ruta para obtener todos los cobros de un estudiante  
router.get('/estudiante/:idEstudiante', [authenticateToken, requireAdmin], cobroCtrl.getCobrosByEstudiante);

module.exports = router;