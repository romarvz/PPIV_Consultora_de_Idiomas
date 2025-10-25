const express = require('express');
const router = express.Router();
const cobroCtrl = require('../controllers/cobros.controller');
const { verifyToken, isAdmin } = require('../middleware/authMiddlewareNew');

// Ruta para crear un nuevo cobro
router.post('/', [verifyToken, isAdmin], cobroCtrl.createCobro);

// Ruta para obtener todos los cobros de un estudiante  
router.get('/estudiante/:idEstudiante', [verifyToken, isAdmin], cobroCtrl.getCobrosByEstudiante);

module.exports = router;