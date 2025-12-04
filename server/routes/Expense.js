const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Expense = require('../models/Expense');



router.post('/', auth, async (req, res) => {
const { tripId, title, amount, currency, paidBy, splits, date } = req.body;
try {
const expense = await Expense.create({ trip: tripId, title, amount, currency, paidBy, splits, date: date || new Date() });
res.json(expense);
} catch (err) { res.status(500).json({ error: err.message }); }
});



router.get('/trip/:tripId', auth, async (req, res) => {
const expenses = await Expense.find({ trip: req.params.tripId }).populate('paidBy').populate('splits.user');
res.json(expenses);
});


module.exports = router;
