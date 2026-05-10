const express = require('express');
const ShipmentController = require('../controllers/shipmentController');
const authMiddleware = require('../middleware/authMiddleware');
const authorizeRole = require('../middleware/roleMiddleware');

const router = express.Router();

router.use(authMiddleware);

router.get('/', authorizeRole('admin', 'penjual', 'pembeli'), ShipmentController.getAll);
router.get('/:id', authorizeRole('admin', 'penjual', 'pembeli'), ShipmentController.getById);
router.post('/', authorizeRole('admin', 'penjual'), ShipmentController.create);

module.exports = router;
