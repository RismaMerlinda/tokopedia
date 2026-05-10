const express = require('express');
const DashboardController = require('../controllers/dashboardController');
const authMiddleware = require('../middleware/authMiddleware');
const authorizeRole = require('../middleware/roleMiddleware');

const router = express.Router();

router.get('/dashboard', authMiddleware, authorizeRole('penjual'), DashboardController.getSellerDashboard);

module.exports = router;
