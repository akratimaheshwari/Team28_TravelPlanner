const mongoose = require('mongoose');
const Schema = mongoose.Schema;


const SplitSchema = new Schema({
user: { type: Schema.Types.ObjectId, ref: 'User' },
share: Number // e.g., fraction or absolute amount depending on type
});


const ExpenseSchema = new Schema({
trip: { type: Schema.Types.ObjectId, ref: 'Trip' },
title: String,
amount: Number,
currency: String,
paidBy: { type: Schema.Types.ObjectId, ref: 'User' },
splits: [SplitSchema],
note: String,
date: Date
}, { timestamps: true });


module.exports = mongoose.model('Expense', ExpenseSchema);