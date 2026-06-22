const Report = require("../models/Report");
const User = require("../models/User");
const Notification = require("../models/Notification");
const { sendSMS } = require("../config/twilio");

// Helper: send SMS + persist notification
async function notifyUser(userId, reportId, message) {
  const user = await User.findById(userId);
  if (!user || !user.phone) return;

  try {
    const twilioMsg = await sendSMS(user.phone, message);
    await Notification.create({
      user: userId,
      report: reportId,
      message,
      twilioSid: twilioMsg.sid,
      status: "sent",
    });
  } catch (err) {
    console.error("SMS notification failed:", err.message);
    await Notification.create({
      user: userId,
      report: reportId,
      message,
      status: "failed",
    });
  }
}

// @route   POST /api/reports
// @desc    Submit a new report (with optional media upload)
// @access  Private
const createReport = async (req, res) => {
  try {
    const { description, longitude, latitude, category } = req.body;

    if (!description) {
      return res
        .status(400)
        .json({ message: "Report description is required" });
    }
    if (longitude == null || latitude == null) {
      return res.status(400).json({
        message: "GPS coordinates (longitude, latitude) are required",
      });
    }
    if (!category) {
      return res.status(400).json({ message: "Report category is required" });
    }

    // Build media array from Cloudinary uploaded files
    const media =
      req.files && req.files.length > 0
        ? req.files.map((file) => ({
            url: file.path, // Cloudinary secure URL
            publicId: file.filename, // Cloudinary public_id (for deletion)
            mimetype: file.mimetype,
          }))
        : [];

    const report = await Report.create({
      user: req.user._id,
      description,
      category,
      media,
      location: {
        type: "Point",
        coordinates: [parseFloat(longitude), parseFloat(latitude)],
      },
    });

    // SMS: Notify user that report was submitted
    // Send a concise thank-you SMS informing about review timeframe
    await notifyUser(
      req.user._id,
      report._id,
      `Thanks for reporting. Please allow up to 3 working days for review.`,
    );

    res.status(201).json(report);
  } catch (error) {
    console.error("Create report error:", error);
    res.status(500).json({ message: "Server error while creating report" });
  }
};

// @route   GET /api/reports
// @desc    Get all reports for the logged-in user
// @access  Private
const getMyReports = async (req, res) => {
  try {
    const reports = await Report.find({ user: req.user._id }).sort({
      createdAt: -1,
    });
    res.json(reports);
  } catch (error) {
    console.error("Get my reports error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// @route   GET /api/reports/all
// @desc    Get ALL reports (admin only)
// @access  Private / Admin
const getAllReports = async (req, res) => {
  try {
    const reports = await Report.find()
      .populate("user", "cpr name phone")
      .populate("assignedTo", "name email")
      .sort({ createdAt: -1 });
    res.json(reports);
  } catch (error) {
    console.error("Get all reports error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// @route   GET /api/reports/:id
// @desc    Get a single report by ID
// @access  Private
const getReportById = async (req, res) => {
  try {
    const report = await Report.findById(req.params.id)
      .populate("user", "cpr name phone")
      .populate("assignedTo", "name email");

    if (!report) {
      return res.status(404).json({ message: "Report not found" });
    }

    // Normal users can only view their own reports
    if (
      req.user.role !== "admin" &&
      report.user._id.toString() !== req.user._id.toString()
    ) {
      return res
        .status(403)
        .json({ message: "Not authorized to view this report" });
    }

    res.json(report);
  } catch (error) {
    console.error("Get report error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// @route   PUT /api/reports/:id/assign
// @desc    Admin assigns report to themselves
//          -> status becomes "under_review"
// @access  Private / Admin
const assignReport = async (req, res) => {
  try {
    const report = await Report.findById(req.params.id);
    if (!report) {
      return res.status(404).json({ message: "Report not found" });
    }

    if (report.status !== "pending") {
      return res.status(400).json({
        message: "Only pending reports can be assigned",
      });
    }

    report.assignedTo = req.user._id;
    report.status = "under_review";
    await report.save();

    // NOTE: Per request, do NOT send an SMS when a report is assigned to a moderator.

    const updated = await Report.findById(report._id)
      .populate("user", "cpr name phone balance")
      .populate("assignedTo", "name email");

    res.json(updated);
  } catch (error) {
    console.error("Assign report error:", error);
    res.status(500).json({ message: "Server error while assigning report" });
  }
};

// @route   PUT /api/reports/:id/status
// @desc    Update report status (admin)
//          Status flow:
//            pending -> under_review (via assign)
//            under_review -> confirmed | rejected | resolved
//          Once assigned, cannot go back to pending.
//          Resolved -> user gets reward points.
// @access  Private / Admin
const updateReportStatus = async (req, res) => {
  try {
    const { status, adminNotes } = req.body;

    const validStatuses = ["pending", "under_review", "rejected", "resolved"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        message: `Invalid status. Must be one of: ${validStatuses.join(", ")}`,
      });
    }

    const report = await Report.findById(req.params.id);
    if (!report) {
      return res.status(404).json({ message: "Report not found" });
    }

    const previousStatus = report.status;

    // Status transition rules
    // Once a report leaves pending, it cannot go back to pending
    if (previousStatus !== "pending" && status === "pending") {
      return res.status(400).json({
        message: "Cannot move report back to pending once it has been reviewed",
      });
    }

    report.status = status;
    if (adminNotes) report.adminNotes = adminNotes;

    // If moving to under_review and not yet assigned, auto-assign to current admin
    if (status === "under_review" && !report.assignedTo) {
      report.assignedTo = req.user._id;
    }

    await report.save();

    // SMS: Notify user about the status change
    const statusLabels = {
      pending: "Pending",
      under_review: "Under Review",
      rejected: "Rejected",
      resolved: "Resolved",
    };

    let smsBody = `Your traffic report (ID: ${report._id}) status has been updated to "${statusLabels[status]}".`;
    if (adminNotes) {
      smsBody += ` Note: ${adminNotes}`;
    }
    if (status === "resolved") {
      smsBody += ` Thank you for your contribution to road safety!`;
    }
    if (status === "rejected") {
      smsBody += ` If you believe this is an error, please submit a new report with more details.`;
    }

    await notifyUser(report.user, report._id, smsBody);

    // Award BHD earnings if report is resolved
    if (status === "resolved" && previousStatus !== "resolved") {
      // Fine table (BHD) per category — 5% of fine goes to reporter
      const FINE_TABLE = {
        drunk_driving: 500,
        reckless_driving: 200,
        speeding: 80,
        traffic_signal: 60,
        illegal_parking: 20,
        accident: 100,
        road_hazard: 40,
        other: 20,
      };
      const REWARD_PERCENT = 5;

      const category = report.category ?? "other";
      const fineAmountBHD = FINE_TABLE[category] ?? FINE_TABLE.other;
      const rewardAmountBHD = parseFloat(
        ((fineAmountBHD * REWARD_PERCENT) / 100).toFixed(3),
      );

      const reportOwner = await User.findById(report.user);
      if (reportOwner) {
        reportOwner.balance = parseFloat(
          ((reportOwner.balance ?? 0) + rewardAmountBHD).toFixed(3),
        );
        reportOwner.totalEarned = parseFloat(
          ((reportOwner.totalEarned ?? 0) + rewardAmountBHD).toFixed(3),
        );
        reportOwner.earnings.push({
          title: "Report Resolved",
          description: `${REWARD_PERCENT}% of ${fineAmountBHD} BHD fine for resolved ${category.replace(/_/g, " ")} report`,
          amountBHD: rewardAmountBHD,
          fineAmountBHD,
          rewardPercent: REWARD_PERCENT,
          category,
          reportId: report._id,
        });
        await reportOwner.save();

        // Update SMS to mention the BHD earned
        smsBody += ` You earned ${rewardAmountBHD} BHD for this report!`;
      }
    }

    // Return the updated report
    const updatedReport = await Report.findById(report._id)
      .populate("user", "cpr name phone balance")
      .populate("assignedTo", "name email");

    res.json(updatedReport);
  } catch (error) {
    console.error("Update report status error:", error);
    res
      .status(500)
      .json({ message: "Server error while updating report status" });
  }
};

module.exports = {
  createReport,
  getMyReports,
  getAllReports,
  getReportById,
  assignReport,
  updateReportStatus,
};
