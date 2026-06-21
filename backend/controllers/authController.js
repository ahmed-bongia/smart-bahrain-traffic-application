 const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { sendSMS } = require("../config/twilio");

// Helper – generate JWT
const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });
};

// @route   POST /api/auth/register
// @desc    Register a new user with Bahrain CPR
// @access  Public
// Note: We use CPR as the unique identifier for users, and we do not allow registration without a valid CPR. Passwords are hashed before storage.
const register = async (req, res) => {
  try {
    const { cpr, name, phone, password } = req.body;

    // Validate CPR format (9-digit Bahrain CPR)
    if (!cpr || !/^\d{9}$/.test(cpr)) {
      return res
        .status(400)
        .json({ message: "A valid 9-digit Bahrain CPR number is required" });
    }

    // Check if CPR is already registered
    const existingUser = await User.findOne({ cpr });
    if (existingUser) {
      return res
        .status(409)
        .json({ message: "A user with this CPR already exists" });
    }

    // Hash password
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    const user = await User.create({
      cpr,
      name,
      phone,
      password: hashedPassword,
    });

    // Return user + token
    const token = generateToken(user._id);

    res.status(201).json({
      _id: user._id,
      cpr: user.cpr,
      name: user.name,
      phone: user.phone,
      role: user.role,
      balance: user.balance,
      totalEarned: user.totalEarned,
      token,
    });
  } catch (error) {
    console.error("Register error:", error);
    res.status(500).json({ message: "Server error during registration" });
  }
};

// @route   POST /api/auth/login
// @desc    Login with CPR + password
// @access  Public
const login = async (req, res) => {
  try {
    const { cpr, password } = req.body;

    if (!cpr || !password) {
      return res.status(400).json({ message: "CPR and password are required" });
    }

    // Find user and include password for comparison
    const user = await User.findOne({ cpr }).select("+password");
    if (!user) {
      return res.status(401).json({ message: "Invalid CPR or password" });
    }

    // Compare passwords
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid CPR or password" });
    }

    const token = generateToken(user._id);

    res.json({
      _id: user._id,
      cpr: user.cpr,
      name: user.name,
      phone: user.phone,
      role: user.role,
      balance: user.balance,
      totalEarned: user.totalEarned,
      token,
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Server error during login" });
  }
};

// @route   GET /api/auth/me
// @desc    Get current logged-in user profile
// @access  Private
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    res.json(user);
  } catch (error) {
    console.error("GetMe error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// @route   POST /api/auth/forgot
// @desc    Start forgot-password flow by CPR: generate 6-digit OTP and SMS it
// @access  Public
const forgotPassword = async (req, res) => {
  try {
    const { cpr } = req.body;
    if (!cpr) return res.status(400).json({ message: "CPR is required" });

    const user = await User.findOne({ cpr }).select(
      "+resetCode +phone +resetCodeExpires",
    );
    if (!user)
      return res
        .status(404)
        .json({ message: "User with provided CPR not found" });
    if (!user.phone)
      return res
        .status(400)
        .json({ message: "User has no phone number on record" });

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expires = Date.now() + 1000 * 60 * 15; // 15 minutes

    user.resetCode = otp;
    user.resetCodeExpires = new Date(expires);
    await user.save();

    // Send SMS with the OTP
    const smsBody = `Your password reset code is: ${otp}. It expires in 15 minutes.`;
    try {
      await sendSMS(user.phone, smsBody);
    } catch (err) {
      console.error("Failed to send reset SMS:", err.message);
      // Do not reveal Twilio errors to client, but persist the code so user can still use it if SMS succeeded later
    }

    res.json({ message: "OTP sent to registered phone number if available" });
  } catch (error) {
    console.error("Forgot password error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Helper: generate a short-lived reset JWT used to allow changing password after OTP verification
const generateResetToken = (userId) => {
  return jwt.sign(
    { id: userId, action: "password_reset" },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.PW_RESET_EXPIRES_IN || "15m",
    },
  );
};

// @route   POST /api/auth/verify-otp
// @desc    Verify OTP (cpr + otp) and return a short-lived reset token
// @access  Public
const verifyOtp = async (req, res) => {
  try {
    const { cpr, otp } = req.body;
    if (!cpr || !otp)
      return res.status(400).json({ message: "CPR and OTP are required" });

    const user = await User.findOne({ cpr }).select(
      "+resetCode +resetCodeExpires",
    );
    if (!user) return res.status(404).json({ message: "User not found" });

    if (!user.resetCode || !user.resetCodeExpires) {
      return res
        .status(400)
        .json({ message: "No reset request found for this account" });
    }

    if (user.resetCodeExpires.getTime() < Date.now()) {
      return res.status(400).json({ message: "OTP expired" });
    }

    if (user.resetCode !== otp.toString()) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    // OTP valid — generate a reset token the client can use to change password
    const resetToken = generateResetToken(user._id);

    // Clear the resetCode so it can't be reused (optional: keep until password change; we clear for safety)
    user.resetCode = undefined;
    user.resetCodeExpires = undefined;
    await user.save();

    res.json({ resetToken });
  } catch (error) {
    console.error("Verify OTP error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// @route   POST /api/auth/reset-password
// @desc    Reset password using reset token (returned from verify-otp)
// @access  Public (requires valid resetToken)
const resetPassword = async (req, res) => {
  try {
    const { resetToken, newPassword } = req.body;
    if (!resetToken || !newPassword)
      return res
        .status(400)
        .json({ message: "resetToken and newPassword are required" });

    let payload;
    try {
      payload = jwt.verify(resetToken, process.env.JWT_SECRET);
    } catch (err) {
      return res
        .status(400)
        .json({ message: "Invalid or expired reset token" });
    }

    if (!payload || payload.action !== "password_reset") {
      return res.status(400).json({ message: "Invalid reset token" });
    }

    const user = await User.findById(payload.id).select("+password");
    if (!user) return res.status(404).json({ message: "User not found" });

    const salt = await bcrypt.genSalt(12);
    user.password = await bcrypt.hash(newPassword, salt);

    // Clear any lingering reset fields
    user.resetCode = undefined;
    user.resetCodeExpires = undefined;

    await user.save();

    res.json({ message: "Password reset successful" });
  } catch (error) {
    console.error("Reset password error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  register,
  login,
  getMe,
  forgotPassword,
  verifyOtp,
  resetPassword,
};
