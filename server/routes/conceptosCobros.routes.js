const express = require('express');
const router = express.Router();

const conceptCtrl = require('../controllers/conceptosCobros.controller');

router.post('/', conceptCtrl.createConcept);
router.get('/', conceptCtrl.getAllConcepts);
router.get('/:id', conceptCtrl.getConceptById);
router.put('/:id', conceptCtrl.updateConcept);
router.delete('/:id', conceptCtrl.deleteConcept);

module.exports = router;