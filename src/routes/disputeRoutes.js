const express = require('express');
const DisputeController = require('../controllers/disputeController');
const authMiddleware = require('../middleware/authMiddleware');
const authorizeRole = require('../middleware/roleMiddleware');

const router = express.Router();

router.use(authMiddleware);

router.get('/', DisputeController.getAll);
router.get('/:id', DisputeController.getById);

// Pembeli membuat sanggahan (dispute)
router.post('/', authorizeRole('pembeli'), DisputeController.create);

// Penjual menanggapi sanggahan
router.put('/:id/respond', authorizeRole('penjual'), DisputeController.respond);

// Admin memperbarui/menghapus
router.put('/:id', authorizeRole('admin'), DisputeController.update);
router.delete('/:id', authorizeRole('admin'), DisputeController.delete);

module.exports = router;
