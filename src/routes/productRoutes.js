const express = require('express');
const ProductController = require('../controllers/productController');
const authMiddleware = require('../middleware/authMiddleware');
const authorizeRole = require('../middleware/roleMiddleware');

const router = express.Router();

// Publik: melihat produk
router.get('/', ProductController.getAll);
router.get('/:id', ProductController.getById);

// Terlindungi: buat produk (admin & penjual)
router.post('/', authMiddleware, authorizeRole('admin', 'penjual'), ProductController.create);

// Terlindungi: update & hapus (otorisasi diperiksa di controller untuk mengizinkan produk milik sendiri atau admin)
router.put('/:id', authMiddleware, authorizeRole('admin', 'penjual'), ProductController.update);
router.delete('/:id', authMiddleware, authorizeRole('admin', 'penjual'), ProductController.delete);

module.exports = router;
