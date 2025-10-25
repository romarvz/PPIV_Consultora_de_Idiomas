const express = require('express');
const router = express.Router();
const conceptCtrl = require('../controllers/conceptosCobros.controller');
const { authenticateToken, requireAdmin } = require('../middleware/authMiddlewareNew');

router.post('/', [authenticateToken, requireAdmin], conceptCtrl.createConcept);
router.get('/', [authenticateToken, requireAdmin], conceptCtrl.getAllConcepts);
router.get('/:id', [authenticateToken, requireAdmin], conceptCtrl.getConceptById);
router.put('/:id', [authenticateToken, requireAdmin], conceptCtrl.updateConcept);
router.delete('/:id', [authenticateToken, requireAdmin], conceptCtrl.deleteConcept);

module.exports = router;