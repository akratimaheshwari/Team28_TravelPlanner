const mongoose = require('mongoose');


const TicketSchema = new mongoose.Schema({
trip: { type: mongoose.Schema.Types.ObjectId, ref: 'Trip', required: true, index: true },
itineraryItem: { type: mongoose.Schema.Types.ObjectId, ref: 'ItineraryItem' },
filename: { type: String, required: true },
url: { type: String, required: true },
uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
createdAt: { type: Date, default: Date.now }
});


module.exports = mongoose.model('Ticket', TicketSchema);