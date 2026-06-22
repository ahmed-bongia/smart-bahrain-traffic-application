const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const Report = require("../models/Report");

// Helper – generate JWT
const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });
};

// @route   POST /api/admin/register
// @desc    Register a new admin account (email + password)
// @access  Public (or lock down with a secret key in production)
const adminRegister = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res
        .status(400)
        .json({ message: "Name, email, and password are required" });
    }

    if (password.length < 6) {
      return res
        .status(400)
        .json({ message: "Password must be at least 6 characters" });
    }

    const existing = await User.findOne({ email });
    if (existing) {
      return res
        .status(409)
        .json({ message: "An account with this email already exists" });
    }

    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(password, salt);

    const admin = await User.create({
      name,
      email,
      password: hashedPassword,
      role: "admin",
    });

    const token = generateToken(admin._id);

    res.status(201).json({
      _id: admin._id,
      name: admin.name,
      email: admin.email,
      role: admin.role,
      token,
    });
  } catch (error) {
    console.error("Admin register error:", error);
    res.status(500).json({ message: "Server error during registration" });
  }
};

// @route   POST /api/admin/login
// @desc    Admin / Moderator login with email + password
// @access  Public
const adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required" });
    }

    const admin = await User.findOne({
      email,
      role: { $in: ["admin", "moderator"] },
    }).select("+password");
    if (!admin) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const token = generateToken(admin._id);

    res.json({
      _id: admin._id,
      name: admin.name,
      email: admin.email,
      role: admin.role,
      token,
    });
  } catch (error) {
    console.error("Admin login error:", error);
    res.status(500).json({ message: "Server error during login" });
  }
};

// @route   GET /api/admin/me
// @desc    Get current admin profile
// @access  Private / Admin
const getAdminMe = async (req, res) => {
  try {
    const admin = await User.findById(req.user._id).select(
      "_id name email role createdAt",
    );
    res.json(admin);
  } catch (error) {
    console.error("GetAdminMe error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// @route   GET /api/admin/stats
// @desc    Get dashboard statistics
// @access  Private / Admin
const getDashboardStats = async (req, res) => {
  try {
    const [total, pending, under_review, rejected, resolved] =
      await Promise.all([
        Report.countDocuments(),
        Report.countDocuments({ status: "pending" }),
        Report.countDocuments({ status: "under_review" }),
        Report.countDocuments({ status: "rejected" }),
        Report.countDocuments({ status: "resolved" }),
      ]);

    // Reports per month for the last 6 months
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
    sixMonthsAgo.setDate(1);
    sixMonthsAgo.setHours(0, 0, 0, 0);

    const monthlyRaw = await Report.aggregate([
      { $match: { createdAt: { $gte: sixMonthsAgo } } },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } },
    ]);

    const MONTH_NAMES = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];

    const monthlyData = monthlyRaw.map((d) => ({
      month: MONTH_NAMES[d._id.month - 1],
      reports: d.count,
    }));

    // Status breakdown
    const statusBreakdown = [
      { status: "pending", count: pending },
      { status: "under_review", count: under_review },
      { status: "rejected", count: rejected },
      { status: "resolved", count: resolved },
    ];

    // Total users (non-admin)
    const totalUsers = await User.countDocuments({ role: "user" });

    // Reports this month vs last month
    const now = new Date();
    const startOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

    const [reportsThisMonth, reportsLastMonth] = await Promise.all([
      Report.countDocuments({ createdAt: { $gte: startOfThisMonth } }),
      Report.countDocuments({
        createdAt: { $gte: startOfLastMonth, $lt: startOfThisMonth },
      }),
    ]);

    res.json({
      total,
      pending,
      under_review,
      rejected,
      resolved,
      totalUsers,
      reportsThisMonth,
      reportsLastMonth,
      monthlyData,
      statusBreakdown,
    });
  } catch (error) {
    console.error("Dashboard stats error:", error);
    res.status(500).json({ message: "Server error fetching stats" });
  }
};

// @route   GET /api/admin/users
// @desc    Get all regular users
// @access  Private / Admin + Moderator
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({ role: "user" })
      .select("_id cpr name phone balance totalEarned createdAt")
      .sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    console.error("Get all users error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// @route   PUT /api/admin/users/:id/password
// @desc    Reset a user's password
// @access  Private / Admin + Moderator
const resetUserPassword = async (req, res) => {
  try {
    const { id } = req.params;
    const { newPassword } = req.body;

    if (!newPassword || newPassword.length < 6) {
      return res
        .status(400)
        .json({ message: "Password must be at least 6 characters" });
    }

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.role !== "user") {
      return res.status(403).json({ message: "Can only reset regular user passwords" });
    }

    const salt = await bcrypt.genSalt(12);
    user.password = await bcrypt.hash(newPassword, salt);
    await user.save();

    res.json({ message: "Password updated successfully" });
  } catch (error) {
    console.error("Reset user password error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// @route   PUT /api/admin/moderators/:id/password
// @desc    Reset a moderator's password
// @access  Private / Admin only
const resetModeratorPassword = async (req, res) => {
  try {
    const { id } = req.params;
    const { newPassword } = req.body;

    if (!newPassword || newPassword.length < 6) {
      return res
        .status(400)
        .json({ message: "Password must be at least 6 characters" });
    }

    const moderator = await User.findById(id);
    if (!moderator) {
      return res.status(404).json({ message: "Moderator not found" });
    }

    if (moderator.role !== "moderator") {
      return res.status(403).json({ message: "Can only reset moderator passwords" });
    }

    const salt = await bcrypt.genSalt(12);
    moderator.password = await bcrypt.hash(newPassword, salt);
    await moderator.save();

    res.json({ message: "Password updated successfully" });
  } catch (error) {
    console.error("Reset moderator password error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// MODERATOR MANAGEMENT (admin-only)

// @route   GET /api/admin/moderators
// @desc    List all moderator accounts
// @access  Private / Admin only
const getModerators = async (req, res) => {
  try {
    const moderators = await User.find({ role: "moderator" })
      .select("_id name email createdAt updatedAt")
      .sort({ createdAt: -1 });
    res.json(moderators);
  } catch (error) {
    console.error("Get moderators error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// @route   POST /api/admin/moderators
// @desc    Create a new moderator account
// @access  Private / Admin only
const createModerator = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res
        .status(400)
        .json({ message: "Name, email, and password are required" });
    }

    if (password.length < 6) {
      return res
        .status(400)
        .json({ message: "Password must be at least 6 characters" });
    }

    const existing = await User.findOne({ email });
    if (existing) {
      return res
        .status(409)
        .json({ message: "An account with this email already exists" });
    }

    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(password, salt);

    const moderator = await User.create({
      name,
      email,
      password: hashedPassword,
      role: "moderator",
    });

    res.status(201).json({
      _id: moderator._id,
      name: moderator.name,
      email: moderator.email,
      role: moderator.role,
      createdAt: moderator.createdAt,
    });
  } catch (error) {
    console.error("Create moderator error:", error);
    res.status(500).json({ message: "Server error creating moderator" });
  }
};

// @route   PUT /api/admin/moderators/:id
// @desc    Update a moderator account
// @access  Private / Admin only
const updateModerator = async (req, res) => {
  try {
    const moderator = await User.findOne({
      _id: req.params.id,
      role: "moderator",
    });

    if (!moderator) {
      return res.status(404).json({ message: "Moderator not found" });
    }

    const { name, email, password } = req.body;

    if (name) moderator.name = name;

    if (email && email !== moderator.email) {
      const existing = await User.findOne({ email });
      if (existing) {
        return res
          .status(409)
          .json({ message: "An account with this email already exists" });
      }
      moderator.email = email;
    }

    if (password) {
      if (password.length < 6) {
        return res
          .status(400)
          .json({ message: "Password must be at least 6 characters" });
      }
      const salt = await bcrypt.genSalt(12);
      moderator.password = await bcrypt.hash(password, salt);
    }

    await moderator.save();

    res.json({
      _id: moderator._id,
      name: moderator.name,
      email: moderator.email,
      role: moderator.role,
      createdAt: moderator.createdAt,
      updatedAt: moderator.updatedAt,
    });
  } catch (error) {
    console.error("Update moderator error:", error);
    res.status(500).json({ message: "Server error updating moderator" });
  }
};

// @route   DELETE /api/admin/moderators/:id
// @desc    Delete a moderator account
// @access  Private / Admin only
const deleteModerator = async (req, res) => {
  try {
    const moderator = await User.findOne({
      _id: req.params.id,
      role: "moderator",
    });

    if (!moderator) {
      return res.status(404).json({ message: "Moderator not found" });
    }

    await moderator.deleteOne();

    res.json({ message: "Moderator deleted successfully" });
  } catch (error) {
    console.error("Delete moderator error:", error);
    res.status(500).json({ message: "Server error deleting moderator" });
  }
};

module.exports = {
  adminRegister,
  adminLogin,
  getAdminMe,
  getDashboardStats,
  getAllUsers,
  resetUserPassword,
  getModerators,
  resetModeratorPassword,
  createModerator,
  updateModerator,
  deleteModerator,
};
