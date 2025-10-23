const express = require('express');
const router = express.Router();
const categoryCtrl = require('../controllers/conceptCategory.controller');

//Routes
router.post('/', categoryCtrl.createCategory);
router.get('/', categoryCtrl.getAllCategories);
router.get('/:id', categoryCtrl.getCategoryById);
router.put('/:id', categoryCtrl.updateCategory);
router.delete('/:id', categoryCtrl.deleteCategory);

module.exports = router;    