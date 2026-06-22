const mongoose = require("mongoose");

const reportSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    // Report details
    description: {
      type: String,
      required: [true, "Report description is required"],
      trim: true,
    },
    category: {
      type: String,
      enum: [
        "reckless_driving",
        "speeding",
        "accident",
        "road_hazard",
        "illegal_parking",
        "traffic_signal",
        "drunk_driving",
        "other",
      ],
      required: [true, "Report category is required"],
    },
    // Cloudinary URLs for uploaded photos / videos
    media: [
      {
        url: { type: String, required: true },
        publicId: { type: String, required: true }, // Cloudinary public_id (for deletion)
        mimetype: { type: String },
      },
    ],
    // GPS location
    location: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point",
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        required: [true, "GPS coordinates are required"],
      },
    },
    // Status lifecycle
    status: {
      type: String,
      enum: ["pending", "under_review", "rejected", "resolved"],
      default: "pending",
    },
    // Admin notes (optional)
    adminNotes: {
      type: String,
      trim: true,
    },
    // Admin/moderator who is handling this report
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
  },
  { timestamps: true },
);

// GeoJSON 2dsphere index for location queries
reportSchema.index({ location: "2dsphere" });

module.exports = mongoose.model("Report", reportSchema);
