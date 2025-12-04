const Trip = require("../models/Trip");

exports.updateOrder = async (req, res) => {
  try {
    const { activities } = req.body;

    const trip = await Trip.findById(req.params.id);

    trip.activities = activities;
    await trip.save();

    res.json({ message: "Updated" });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
