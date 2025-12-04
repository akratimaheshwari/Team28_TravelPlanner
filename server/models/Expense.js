const mongoose = require('mongoose');


const ExpenseSchema = new mongoose.Schema({
trip: { type: mongoose.Schema.Types.ObjectId, ref: 'Trip', required: true, index: true },
title: { type: String, required: true },
amount: { type: Number, required: true },
currency: { type: String },
paidBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
splits: [{
user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
share: { type: Number, required: true } // absolute amount owed by this user for this expense
}],
type: { type: String, enum: ['equal','percentage','custom'], default: 'equal' },
notes: String,
createdAt: { type: Date, default: Date.now }
});


ExpenseSchema.index({ trip: 1 });


module.exports = mongoose.model('Expense', ExpenseSchema);