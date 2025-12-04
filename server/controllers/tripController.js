const Trip = require('../models/Trip');
const User = require('../models/User');


exports.createTrip = async (req, res, next) => {
try {
const { title, description, startDate, endDate, currency } = req.body;
const trip = await Trip.create({ title, description, startDate, endDate, currency, owner: req.user._id, members: [req.user._id] });
res.json({ trip });
} catch (err) { next(err); }
};


exports.getUserTrips = async (req, res, next) => {
try {
const trips = await Trip.find({ members: req.user._id }).populate('owner', 'name email');
res.json({ trips });
} catch (err) { next(err); }
};


exports.getTrip = async (req, res, next) => {
try {
const trip = await Trip.findById(req.params.id).populate('members', 'name email');
if (!trip) return res.status(404).json({ message: 'Trip not found' });
if (!trip.members.some(m => m._id.equals(req.user._id))) return res.status(403).json({ message: 'Not a member' });
res.json({ trip });
} catch (err) { next(err); }
};


exports.joinTrip = async (req, res, next) => {
try {
const trip = await Trip.findById(req.params.id);
if (!trip) return res.status(404).json({ message: 'Trip not found' });
if (!trip.members.includes(req.user._id)) {
trip.members.push(req.user._id);
await trip.save();
}
res.json({ trip });
} catch (err) { next(err); }
};


exports.leaveTrip = async (req, res, next) => {
try {
const trip = await Trip.findById(req.params.id);
if (!trip) return res.status(404).json({ message: 'Trip not found' });
trip.members = trip.members.filter(m => !m.equals(req.user._id));
await trip.save();
res.json({ trip });
} catch (err) { next(err); }
};


exports.inviteMember = async (req, res, next) => {
try {
const { email } = req.body;
const trip = await Trip.findById(req.params.id);
if (!trip) return res.status(404).json({ message: 'Trip not found' });
if (!trip.owner.equals(req.user._id)) return res.status(403).json({ message: 'Only owner can invite' });
const user = await User.findOne({ email });
if (!user) return res.status(404).json({ message: 'User not found' });
if (!trip.members.includes(user._id)) trip.members.push(user._id);
await trip.save();
res.json({ trip });
} catch (err) { next(err); }
};


exports.deleteTrip = async (req, res, next) => {
try {
const trip = await Trip.findById(req.params.id);
if (!trip) return res.status(404).json({ message: 'Trip not found' });
if (!trip.owner.equals(req.user._id)) return res.status(403).json({ message: 'Only owner can delete' });
await trip.remove();
res.json({ message: 'Deleted' });
} catch (err) { next(err); }
};