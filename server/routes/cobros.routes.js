const express = require('express');
const router = express.Router();
const cobroCtrl = require('../controllers/cobros.controller');

// Ruta para crear un nuevo cobro
router.post('/', cobroCtrl.createCobro);

// Ruta para obtener todos los cobros de un estudiante  
router.get('/estudiante/:idEstudiante', cobroCtrl.getCobrosByEstudiante);

module.exports = router;