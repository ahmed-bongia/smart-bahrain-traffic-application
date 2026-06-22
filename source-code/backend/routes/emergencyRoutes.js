const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/auth");
const {
  getMyEmergencyProfile,
  updateMyEmergencyProfile,
  getEmergencyProfileByToken,
} = require("../controllers/emergencyController");

// Private (user)
router.get("/me", protect, getMyEmergencyProfile);
router.put("/me", protect, updateMyEmergencyProfile);

// Public (QR)
router.get("/public/:token", getEmergencyProfileByToken);

module.exports = router;
