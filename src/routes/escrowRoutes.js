const express = require('express');
const EscrowController = require('../controllers/escrowController');
const authMiddleware = require('../middleware/authMiddleware');
const authorizeRole = require('../middleware/roleMiddleware');

const router = express.Router();

router.use(authMiddleware);
router.use(authorizeRole('admin')); // Hanya Admin yang dapat memantau dan mengelola escrow

router.get('/', EscrowController.getAll);
router.post('/release', EscrowController.manualRelease);
router.post('/refund', EscrowController.manualRefund);

module.exports = router;
