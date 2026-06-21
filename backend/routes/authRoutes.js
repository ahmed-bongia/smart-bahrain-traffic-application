const express = require("express");
const router = express.Router();
const {
  register,
  login,
  getMe,
  forgotPassword,
  verifyOtp,
  resetPassword,
} = require("../controllers/authController");
const { protect } = require("../middleware/auth");

// Public
router.post("/register", register);
router.post("/login", login);

// Private
router.get("/me", protect, getMe);

// Forgot password flow
router.post("/forgot", forgotPassword);
router.post("/verify-otp", verifyOtp);
router.post("/reset-password", resetPassword);

module.exports = router;
