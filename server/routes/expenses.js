const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/auth');
const expenseController = require('../controllers/expenseController');


router.post('/:tripId', verifyToken, expenseController.addExpense);
router.get('/:tripId', verifyToken, expenseController.getExpensesForTrip);
router.get('/:tripId/summary', verifyToken, expenseController.getSettlementSummary);
router.delete('/:id', verifyToken, expenseController.deleteExpense);


module.exports = router;
