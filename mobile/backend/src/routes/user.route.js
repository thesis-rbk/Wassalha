const express = require("express");
const {
  signup,
  loginUser,
  loginAdmin,
  googleLogin,
  requestPasswordReset,
  resetPassword,
  updateReferralSource,
  updatePreferredCategories,
  completeOnboarding,
  changePassword,
  getUserById,
  updateUser,
  deleteUser,
  getUsers,
  banUser,
  unbanUser,
} = require("../controllers/user.controller");
const { getMessages } = require("../controllers/message.controller");
const { authenticateUser, authenticateAdmin, authenticateUserOrAdmin } = require("../middleware/middleware");

const router = express.Router();

// Public routes
router.post("/register", signup);
router.post("/login", loginUser);
router.post("/admin/login", loginAdmin);
router.post("/google-login", googleLogin); // New Google login endpoint
router.post("/reset-password/request", requestPasswordReset);
router.post("/reset-password", resetPassword);
// New route for updating referral source
router.post("/update-referral-source", updateReferralSource);
router.post("/update-preferred-categories", updatePreferredCategories);
router.post("/complete-onboarding", completeOnboarding);
router.put("/change-password", authenticateUser, changePassword);
router.get("/messages", getMessages);

// User CRUD routes
router.get("/", authenticateUserOrAdmin, getUsers); // Get all users
router.get("/:id", authenticateUserOrAdmin, getUserById); // Get a single user
router.put("/:id", authenticateUserOrAdmin, updateUser); // Update user
router.put("/:id/ban",authenticateAdmin,  banUser); // Ban/Unban a user
router.put("/:id/unban",authenticateAdmin, unbanUser); // Unban a user
router.delete("/:id", authenticateUserOrAdmin, deleteUser); // Delete user route

module.exports = router;
