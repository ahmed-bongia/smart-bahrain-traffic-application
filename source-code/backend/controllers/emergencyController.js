const crypto = require("crypto");
const User = require("../models/User");

function generateToken() {
  return crypto.randomBytes(16).toString("hex");
}

// @route   GET /api/emergency/me
// @desc    Get logged-in user's emergency profile (contacts + token)
// @access  Private
const getMyEmergencyProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select(
      "emergencyContacts emergencyPublicToken",
    );

    if (!user) return res.status(404).json({ message: "User not found" });

    if (!user.emergencyPublicToken) {
      user.emergencyPublicToken = generateToken();
      await user.save();
    }

    res.json({
      emergencyContacts: user.emergencyContacts ?? [],
      emergencyPublicToken: user.emergencyPublicToken,
    });
  } catch (error) {
    console.error("Get emergency profile error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// @route   PUT /api/emergency/me
// @desc    Update logged-in user's emergency contacts (generates token if missing)
// @access  Private
const updateMyEmergencyProfile = async (req, res) => {
  try {
    const { emergencyContacts } = req.body;

    if (!Array.isArray(emergencyContacts) || emergencyContacts.length === 0) {
      return res.status(400).json({
        message: "Please provide at least one emergency contact",
      });
    }

    const sanitized = emergencyContacts
      .map((contact) => ({
        name: String(contact?.name ?? "").trim(),
        relationship: String(contact?.relationship ?? "").trim(),
        phone: String(contact?.phone ?? "").trim(),
      }))
      .filter((contact) => contact.name && contact.phone);

    if (sanitized.length === 0) {
      return res.status(400).json({
        message: "Each contact must include a name and phone number",
      });
    }

    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.emergencyContacts = sanitized;

    if (!user.emergencyPublicToken) {
      user.emergencyPublicToken = generateToken();
    }

    await user.save();

    res.json({
      emergencyContacts: user.emergencyContacts ?? [],
      emergencyPublicToken: user.emergencyPublicToken,
    });
  } catch (error) {
    console.error("Update emergency profile error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// @route   GET /api/emergency/public/:token
// @desc    Public emergency profile lookup by token (for QR scan)
// @access  Public
const getEmergencyProfileByToken = async (req, res) => {
  try {
    const { token } = req.params;
    if (!token) return res.status(400).json({ message: "Token is required" });

    const user = await User.findOne({ emergencyPublicToken: token }).select(
      "name emergencyContacts updatedAt",
    );

    if (!user) return res.status(404).json({ message: "Profile not found" });

    res.json({
      name: user.name,
      updatedAt: user.updatedAt,
      emergencyContacts: user.emergencyContacts ?? [],
    });
  } catch (error) {
    console.error("Public emergency profile error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  getMyEmergencyProfile,
  updateMyEmergencyProfile,
  getEmergencyProfileByToken,
};
