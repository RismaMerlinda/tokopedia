const express = require('express');
const CartController = require('../controllers/cartController');
const authMiddleware = require('../middleware/authMiddleware');
const authorizeRole = require('../middleware/roleMiddleware');

const router = express.Router();

// Hanya pembeli (atau mungkin admin) yang boleh menggunakan keranjang belanja
router.use(authMiddleware);

router.get('/', authorizeRole('pembeli'), CartController.getCart);
router.post('/', authorizeRole('pembeli'), CartController.addToCart);
router.put('/:id', authorizeRole('pembeli'), CartController.updateCartItem);
router.delete('/:id', authorizeRole('pembeli'), CartController.removeFromCart);

module.exports = router;
