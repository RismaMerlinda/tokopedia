/**
 * Route: paymentRoutes
 * Mendefinisikan titik akhir (endpoint) API dan mengarahkannya ke controller yang sesuai.
 */
const express = require('express');
const PaymentController = require('../controllers/paymentController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

router.use(authMiddleware);

router.get('/', PaymentController.getAll);
router.get('/:id', PaymentController.getById);
router.post('/', PaymentController.simulatePayment); // Pembeli membayar

module.exports = router;
