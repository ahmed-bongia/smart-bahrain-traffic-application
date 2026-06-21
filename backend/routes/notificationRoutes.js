const express = require("express");
const router = express.Router();
const { protect, authorize } = require("../middleware/auth");
const {
  getMyNotifications,
  getAllNotifications,
} = require("../controllers/notificationController");

// Private – authenticated user
router.get("/", protect, getMyNotifications);

// Private – admin only
router.get("/all", protect, authorize("admin"), getAllNotifications);

module.exports = router;
