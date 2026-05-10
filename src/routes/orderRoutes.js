const express = require('express');
const OrderController = require('../controllers/orderController');
const authMiddleware = require('../middleware/authMiddleware');
const authorizeRole = require('../middleware/roleMiddleware');

const router = express.Router();

router.use(authMiddleware);

router.get('/', OrderController.getAll);
router.get('/:id', OrderController.getById);

// Pembeli membuat pesanan
router.post('/', authorizeRole('pembeli'), OrderController.create);

// Pembeli konfirmasi penerimaan
router.post('/:id/confirm', authorizeRole('pembeli', 'admin'), OrderController.confirmReceipt);

// Admin dapat memperbarui/menghapus secara bebas, mungkin penjual dapat memperbarui status
router.put('/:id', authorizeRole('admin', 'penjual'), OrderController.update);
router.delete('/:id', authorizeRole('admin'), OrderController.delete);

module.exports = router;
