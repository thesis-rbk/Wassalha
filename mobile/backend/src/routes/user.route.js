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
const { authenticateUser, authenticateAdmin } = require("../middleware/middleware");

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
router.get("/", getUsers);
router.get("/messages", getMessages);

// User CRUD routes
router.get("/", authenticateUser, getUsers); // Get all users
router.get("/:id",  getUserById); // Get a single user
router.put("/:id", updateUser); // Update user
router.put("/:id/ban",  banUser); // Ban/Unban a user
router.put("/:id/unban", unbanUser); // Unban a user
router.delete("/users/:id", authenticateUser, deleteUser); // Delete a user

module.exports = router;
