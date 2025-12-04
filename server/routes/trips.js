const express = require('express');
const router = express.Router();
const Trip = require('../models/Trip');
const auth = require('../middleware/auth'); // JWT auth middleware

// Create Trip
router.post('/', auth, async (req, res) => {
  const { name, destination, coverImage, startDate, endDate } = req.body;
  try {
    const trip = new Trip({
      name, destination, coverImage, startDate, endDate,
      admin: req.user.id,
      members: [req.user.id]
    });
    await trip.save();
    res.json(trip);
  } catch(err) { res.status(500).json({ msg: err.message }); }
});

// Get All Trips
router.get('/', auth, async (req,res)=>{
  const trips = await Trip.find({ members: req.user.id });
  res.json(trips);
});

// Add Itinerary Item
router.post('/:tripId/itinerary', auth, async (req,res)=>{
  const { title, date, description } = req.body;
  const trip = await Trip.findById(req.params.tripId);
  trip.itinerary.push({ title, date, description });
  await trip.save();
  res.json(trip);
});

// Add Expense
router.post('/:tripId/expenses', auth, async (req,res)=>{
  const { title, amount, payer, participants, date } = req.body;
  const trip = await Trip.findById(req.params.tripId);
  trip.expenses.push({ title, amount, payer, participants, date });
  await trip.save();
  res.json(trip);
});

module.exports = router;
