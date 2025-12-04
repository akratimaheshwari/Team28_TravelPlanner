const Trip = require("../models/Trip");
const { nanoid } = require("nanoid");

exports.createTrip = async (req, res) => {
  try {
    const { title, destination, startDate, endDate } = req.body;

    const trip = await Trip.create({
      title,
      destination,
      startDate,
      endDate,
      inviteCode: nanoid(8),
      members: [{ user: req.userId, role: "admin" }]
    });

    res.json(trip);

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.joinTrip = async (req, res) => {
  try {
    const { inviteCode } = req.body;

    const trip = await Trip.findOne({ inviteCode });
    if (!trip) return res.status(404).json({ message: "Invalid code" });

    const alreadyIn = trip.members.find(m => m.user.toString() === req.userId);
    if (alreadyIn) return res.json(trip);

    trip.members.push({ user: req.userId, role: "member" });
    await trip.save();

    res.json(trip);

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getTrip = async (req, res) => {
  try {
    const trip = await Trip.findById(req.params.id)
      .populate("members.user")
      .exec();

    res.json(trip);

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.addActivity = async (req, res) => {
  try {
    const trip = await Trip.findById(req.params.id);

    const activity = {
      ...req.body,
      createdBy: req.userId
    };

    trip.activities.push(activity);
    await trip.save();

    res.json(activity);

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
