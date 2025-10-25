const express = require('express');
const router = express.Router();
const categoryCtrl = require('../controllers/conceptCategory.controller');
const { verifyToken, isAdmin } = require('../middleware/authMiddlewareNew');

//Routes
router.post('/', [verifyToken, isAdmin], categoryCtrl.createCategory);
router.get('/', [verifyToken, isAdmin], categoryCtrl.getAllCategories);
router.get('/:id', [verifyToken, isAdmin], categoryCtrl.getCategoryById);
router.put('/:id', [verifyToken, isAdmin], categoryCtrl.updateCategory);
router.delete('/:id', [verifyToken, isAdmin], categoryCtrl.deleteCategory);

module.exports = router;    