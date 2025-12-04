const Ticket = require('../models/Ticket');
const Trip = require('../models/Trip');


exports.uploadTicket = async (req, res, next) => {
try {
const { tripId } = req.params;
const trip = await Trip.findById(tripId);
if (!trip) return res.status(404).json({ message: 'Trip not found' });
if (!trip.members.some(m => m.equals(req.user._id))) return res.status(403).json({ message: 'Not a member' });
if (!req.file) return res.status(400).json({ message: 'No file' });
const url = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
const ticket = await Ticket.create({ trip: tripId, filename: req.file.originalname, url, uploadedBy: req.user._id });
res.json({ ticket });
} catch (err) { next(err); }
};