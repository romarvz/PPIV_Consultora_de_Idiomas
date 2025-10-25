const express = require('express');
const router = express.Router();
const conceptCtrl = require('../controllers/conceptosCobros.controller');
const { verifyToken, isAdmin } = require('../middleware/authMiddlewareNew');

router.post('/', [verifyToken, isAdmin], conceptCtrl.createConcept);
router.get('/', [verifyToken, isAdmin], conceptCtrl.getAllConcepts);
router.get('/:id', [verifyToken, isAdmin], conceptCtrl.getConceptById);
router.put('/:id', [verifyToken, isAdmin], conceptCtrl.updateConcept);
router.delete('/:id', [verifyToken, isAdmin], conceptCtrl.deleteConcept);

module.exports = router;