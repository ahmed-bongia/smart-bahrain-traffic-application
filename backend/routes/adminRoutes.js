const express = require("express");
const router = express.Router();
const { protect, authorize } = require("../middleware/auth");
const {
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
} = require("../controllers/adminController");

// Public
router.post("/register", adminRegister);
router.post("/login", adminLogin);

// Private – admin + moderator
router.get("/me", protect, authorize("admin", "moderator"), getAdminMe);
router.get(
  "/stats",
  protect,
  authorize("admin", "moderator"),
  getDashboardStats,
);
router.get("/users", protect, authorize("admin", "moderator"), getAllUsers);
router.put("/users/:id/password", protect, authorize("admin", "moderator"), resetUserPassword);

// Private – admin only (moderator management)
router.get("/moderators", protect, authorize("admin"), getModerators);
router.put("/moderators/:id/password", protect, authorize("admin"), resetModeratorPassword);
router.post("/moderators", protect, authorize("admin"), createModerator);
router.put("/moderators/:id", protect, authorize("admin"), updateModerator);
router.delete("/moderators/:id", protect, authorize("admin"), deleteModerator);

module.exports = router;
