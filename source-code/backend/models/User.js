const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    // Bahrain CPR number (9-digit unique identifier) — required for regular users, optional for admins
    cpr: {
      type: String,
      unique: true,
      sparse: true, // allows multiple null values (admins may not have CPR)
      match: [/^\d{9}$/, "CPR must be a 9-digit number"],
    },
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },
    // Email — used by admin accounts for dashboard login
    email: {
      type: String,
      unique: true,
      sparse: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Please enter a valid email address"],
    },
    phone: {
      type: String,
      match: [
        /^\+\d{8,15}$/,
        "Phone must be in E.164 format (e.g. +97312345678)",
      ],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: 6,
      select: false, // never returned in queries by default
    },
    role: {
      type: String,
      enum: ["user", "admin", "moderator"],
      default: "user",
    },
    // Reward / earnings system
    // balance: total BHD earned and not yet withdrawn
    balance: {
      type: Number,
      default: 0,
    },
    // totalEarned: lifetime BHD earnings (never decremented)
    totalEarned: {
      type: Number,
      default: 0,
    },
    // Individual earning records (one per resolved report)
    earnings: [
      {
        title: String,
        description: String,
        amountBHD: Number, // e.g. 1.00
        fineAmountBHD: Number, // full fine, e.g. 20.00
        rewardPercent: Number, // e.g. 5 (%)
        category: String,
        reportId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Report",
        },
        awardedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    // Withdrawal requests
    withdrawalRequests: [
      {
        amountBHD: Number,
        status: {
          type: String,
          enum: ["pending", "approved", "rejected"],
          default: "pending",
        },
        requestedAt: {
          type: Date,
          default: Date.now,
        },
        processedAt: Date,
      },
    ],
    // Emergency contacts + public QR token
    emergencyContacts: [
      {
        name: { type: String, trim: true },
        relationship: { type: String, trim: true },
        phone: {
          type: String,
          match: [
            /^\+\d{8,15}$/,
            "Phone must be in E.164 format (e.g. +97312345678)",
          ],
        },
      },
    ],
    emergencyPublicToken: {
      type: String,
      unique: true,
      sparse: true,
    },
    // Password reset OTP (for 'forgot password' flow)
    resetCode: {
      type: String,
      select: false,
    },
    resetCodeExpires: Date,
  },
  { timestamps: true },
);

module.exports = mongoose.model("User", userSchema);
