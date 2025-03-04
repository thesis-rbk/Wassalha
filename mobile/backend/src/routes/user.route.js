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
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
} = require("../controllers/user.controller");
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
router.put('/change-password', authenticateUser, changePassword);

// User CRUD routes
router.get("/users", authenticateUser, getAllUsers); // Get all users
router.get("/users/:id", authenticateUser, getUserById); // Get a single user
router.put("/users/:id", authenticateUser, updateUser); // Update a user
router.delete("/users/:id", authenticateUser, deleteUser); // Delete a user

// Admin CRUD routes
router.get("/",getAllUsers); // Get all users (admin only)
router.get("/:id",getUserById); // Get a single user (admin only)
router.put("/:id",updateUser); // Update a user (admin only)
router.delete("/:id",deleteUser); // Delete a user (admin only)

module.exports = router;
