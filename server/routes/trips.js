const router = require("express").Router();
const auth = require("../middleware/auth");
const {
  createTrip,
  joinTrip,
  getTrip,
  addActivity
} = require("../controllers/tripController");


router.post("/", auth, createTrip);


router.post("/join", auth, joinTrip);


router.get("/:id", auth, getTrip);


router.post("/:id/activities", auth, addActivity);

module.exports = router;
