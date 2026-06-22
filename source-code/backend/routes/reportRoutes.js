const express = require("express");
const router = express.Router();
const { protect, authorize } = require("../middleware/auth");
const { upload } = require("../config/cloudinary");
const {
  createReport,
  getMyReports,
  getAllReports,
  getReportById,
  assignReport,
  updateReportStatus,
} = require("../controllers/reportController");

// Private – any authenticated user
router.post("/", protect, upload.array("media", 10), createReport);
router.get("/", protect, getMyReports);
router.get("/:id", protect, getReportById);

// Private – admin + moderator
router.get(
  "/all/list",
  protect,
  authorize("admin", "moderator"),
  getAllReports,
);
router.put(
  "/:id/assign",
  protect,
  authorize("admin", "moderator"),
  assignReport,
);
router.put(
  "/:id/status",
  protect,
  authorize("admin", "moderator"),
  updateReportStatus,
);

module.exports = router;
