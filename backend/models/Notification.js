const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    report: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Report",
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    // Twilio message SID for tracking
    twilioSid: {
      type: String,
    },
    status: {
      type: String,
      enum: ["sent", "failed"],
      default: "sent",
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Notification", notificationSchema);
