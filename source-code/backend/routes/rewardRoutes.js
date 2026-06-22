const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/auth");
const {
  getMyRewards,
  requestWithdrawal,
  getLeaderboard,
} = require("../controllers/rewardController");

// Private
router.get("/", protect, getMyRewards);
router.post("/withdraw", protect, requestWithdrawal);

// Public
router.get("/leaderboard", getLeaderboard);

module.exports = router;
