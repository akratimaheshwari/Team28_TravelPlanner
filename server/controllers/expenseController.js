const Expense = require("../models/Expense");

exports.addExpense = async (req, res) => {
  try {
    const expense = await Expense.create(req.body);
    res.json(expense);

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getTripExpenses = async (req, res) => {
  try {
    const expenses = await Expense.find({ trip: req.params.tripId })
      .populate("paidBy")
      .populate("splits.user");

    res.json(expenses);

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
