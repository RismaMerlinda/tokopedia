const express = require('express');
const TransactionHistoryController = require('../controllers/transactionHistoryController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

router.use(authMiddleware);

router.get('/', TransactionHistoryController.getAll);
router.get('/:id', TransactionHistoryController.getById);
router.post('/', TransactionHistoryController.create);
router.put('/:id', TransactionHistoryController.update);
router.delete('/:id', TransactionHistoryController.delete);

module.exports = router;
