const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/auth');
const itineraryController = require('../controllers/itineraryController');


router.post('/:tripId', verifyToken, itineraryController.addItem);
router.patch('/:id', verifyToken, itineraryController.updateItem);
router.delete('/:id', verifyToken, itineraryController.deleteItem);
router.get('/trip/:tripId', verifyToken, itineraryController.getItemsForTrip);


module.exports = router;