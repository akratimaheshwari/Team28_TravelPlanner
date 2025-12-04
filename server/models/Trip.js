const mongoose = require('mongoose');


const TripSchema = new mongoose.Schema({
title: { type: String, required: true },
description: { type: String },
owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
startDate: { type: Date },
endDate: { type: Date },
currency: { type: String, default: 'INR' },
createdAt: { type: Date, default: Date.now }
});


TripSchema.index({ owner: 1 });


module.exports = mongoose.model('Trip', TripSchema);