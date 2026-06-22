const User = require("../models/User");

const MINIMUM_WITHDRAWAL_BHD = 100;

// @route   GET /api/rewards
// @desc    Get logged-in user's balance, earnings & withdrawal history
// @access  Private
const getMyRewards = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select(
      "balance totalEarned earnings withdrawalRequests",
    );
    res.json({
      balance: user.balance ?? 0,
      totalEarned: user.totalEarned ?? 0,
      earnings: user.earnings ?? [],
      withdrawalRequests: user.withdrawalRequests ?? [],
      minimumWithdrawal: MINIMUM_WITHDRAWAL_BHD,
    });
  } catch (error) {
    console.error("Get rewards error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// @route   POST /api/rewards/withdraw
// @desc    Request a withdrawal (min 100 BHD)
// @access  Private
const requestWithdrawal = async (req, res) => {
  try {
    const { amountBHD } = req.body;

    if (!amountBHD || amountBHD < MINIMUM_WITHDRAWAL_BHD) {
      return res.status(400).json({
        message: `Minimum withdrawal amount is ${MINIMUM_WITHDRAWAL_BHD} BHD`,
      });
    }

    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: "User not found" });

    if ((user.balance ?? 0) < amountBHD) {
      return res.status(400).json({
        message: `Insufficient balance. Available: ${(user.balance ?? 0).toFixed(3)} BHD`,
      });
    }

    // Check no pending withdrawal already exists
    const hasPending = user.withdrawalRequests?.some(
      (w) => w.status === "pending",
    );
    if (hasPending) {
      return res.status(400).json({
        message: "You already have a pending withdrawal request",
      });
    }

    // Deduct balance and record request
    user.balance = parseFloat(((user.balance ?? 0) - amountBHD).toFixed(3));
    user.withdrawalRequests.push({ amountBHD });
    await user.save();

    res.json({
      message: `Withdrawal request of ${amountBHD} BHD submitted successfully`,
      balance: user.balance,
    });
  } catch (error) {
    console.error("Withdrawal error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// @route   GET /api/rewards/leaderboard
// @desc    Top users by total earned BHD
// @access  Public
const getLeaderboard = async (_req, res) => {
  try {
    const leaderboard = await User.find({ totalEarned: { $gt: 0 } })
      .select("name totalEarned")
      .sort({ totalEarned: -1 })
      .limit(20);

    res.json(leaderboard);
  } catch (error) {
    console.error("Leaderboard error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = { getMyRewards, requestWithdrawal, getLeaderboard };
