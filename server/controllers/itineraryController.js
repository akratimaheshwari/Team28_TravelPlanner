const ItineraryItem = require('../models/Itinerary');
const Trip = require('../models/Trip');
const { getIO } = require('../socket');


async function ensureMember(tripId, userId) {
const trip = await Trip.findById(tripId);
if (!trip) throw { status: 404, message: 'Trip not found' };
if (!trip.members.some(m => m.equals(userId))) throw { status: 403, message: 'Not a member' };
return trip;
}


exports.addItem = async (req, res, next) => {
try {
const { tripId } = req.params;
await ensureMember(tripId, req.user._id);
const item = await ItineraryItem.create({ ...req.body, trip: tripId, createdBy: req.user._id });
getIO().to(tripId).emit('itineraryUpdated', { action: 'add', item });
res.json({ item });
} catch (err) { next(err); }
};


exports.updateItem = async (req, res, next) => {
try {
const item = await ItineraryItem.findById(req.params.id);
if (!item) return res.status(404).json({ message: 'Not found' });
const trip = await Trip.findById(item.trip);
if (!trip.members.some(m => m.equals(req.user._id))) return res.status(403).json({ message: 'Not a member' });
Object.assign(item, req.body);
await item.save();
getIO().to(item.trip.toString()).emit('itineraryUpdated', { action: 'update', item });
res.json({ item });
} catch (err) { next(err); }
};


exports.deleteItem = async (req, res, next) => {
try {
const item = await ItineraryItem.findById(req.params.id);
if (!item) return res.status(404).json({ message: 'Not found' });
const trip = await Trip.findById(item.trip);
if (!trip.members.some(m => m.equals(req.user._id))) return res.status(403).json({ message: 'Not a member' });
await item.remove();
getIO().to(item.trip.toString()).emit('itineraryUpdated', { action: 'delete', id: item._id });
res.json({ message: 'Deleted' });
} catch (err) { next(err); }
};


exports.getItemsForTrip = async (req, res, next) => {
try {
await ensureMember(req.params.tripId, req.user._id);
const items = await ItineraryItem.find({ trip: req.params.tripId }).sort('start');
res.json({ items });
} catch (err) { next(err); }
};