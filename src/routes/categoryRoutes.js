const express = require('express');
const CategoryController = require('../controllers/categoryController');
const authMiddleware = require('../middleware/authMiddleware');
const authorizeRole = require('../middleware/roleMiddleware');

const router = express.Router();

// Semua bisa view categories
router.get('/', CategoryController.getAll);

// Hanya admin yang bisa CRUD
router.post('/', authMiddleware, authorizeRole('admin'), CategoryController.create);
router.put('/:id', authMiddleware, authorizeRole('admin'), CategoryController.update);
router.delete('/:id', authMiddleware, authorizeRole('admin'), CategoryController.delete);

module.exports = router;
