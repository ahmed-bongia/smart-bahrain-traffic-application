const Notification = require("../models/Notification");

// @route   GET /api/notifications
// @desc    Get all notifications for the logged-in user
// @access  Private
const getMyNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ user: req.user._id })
      .populate("report", "description status")
      .sort({ createdAt: -1 });

    res.json(notifications);
  } catch (error) {
    console.error("Get notifications error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// @route   GET /api/notifications/all
// @desc    Get ALL notifications (admin only)
// @access  Private / Admin
const getAllNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find()
      .populate("user", "cpr name phone")
      .populate("report", "description status")
      .sort({ createdAt: -1 });

    res.json(notifications);
  } catch (error) {
    console.error("Get all notifications error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = { getMyNotifications, getAllNotifications };
