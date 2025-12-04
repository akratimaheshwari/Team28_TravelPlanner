const mongoose = require('mongoose');


const ItinerarySchema = new mongoose.Schema({
trip: { type: mongoose.Schema.Types.ObjectId, ref: 'Trip', required: true, index: true },
title: { type: String, required: true },
description: String,
location: String,
start: Date,
end: Date,
attachments: [{ type: String }], // stored file urls
createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
createdAt: { type: Date, default: Date.now }
});


module.exports = mongoose.model('ItineraryItem', ItinerarySchema);