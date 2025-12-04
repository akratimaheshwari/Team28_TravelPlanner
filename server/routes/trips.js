const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/auth');
const tripController = require('../controllers/tripController');


router.post('/', verifyToken, tripController.createTrip);
router.get('/', verifyToken, tripController.getUserTrips);
router.get('/:id', verifyToken, tripController.getTrip);
router.post('/:id/join', verifyToken, tripController.joinTrip);
router.post('/:id/leave', verifyToken, tripController.leaveTrip);
router.post('/:id/invite', verifyToken, tripController.inviteMember);
router.delete('/:id', verifyToken, tripController.deleteTrip);


module.exports = router;