const router = require("express").Router();
const auth = require("../middleware/auth");
const { updateOrder } = require("../controllers/activityController");

router.post("/:id/update-order", auth, updateOrder);

module.exports = router;
