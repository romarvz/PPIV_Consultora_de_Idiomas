const express = require('express');
const router = express.Router();
const categoryCtrl = require('../controllers/conceptCategory.controller');
const { authenticateToken, requireAdmin } = require('../middleware/authMiddlewareNew');

//Routes
router.post('/', [authenticateToken, requireAdmin], categoryCtrl.createCategory);
router.get('/', [authenticateToken, requireAdmin], categoryCtrl.getAllCategories);
router.get('/:id', [authenticateToken, requireAdmin], categoryCtrl.getCategoryById);
router.put('/:id', [authenticateToken, requireAdmin], categoryCtrl.updateCategory);
router.delete('/:id', [authenticateToken, requireAdmin], categoryCtrl.deleteCategory);

module.exports = router;    