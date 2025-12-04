const router = require("express").Router();
const auth = require("../middleware/auth");
const {
  addExpense,
  getTripExpenses
} = require("../controllers/expenseController");

router.post("/", auth, addExpense);
router.get("/trip/:tripId", auth, getTripExpenses);

module.exports = router;
