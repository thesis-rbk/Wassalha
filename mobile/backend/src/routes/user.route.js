const express = require("express");
const {
  signup,
  loginUser,
  googleLogin,
  requestPasswordReset,
  resetPassword,
  updateReferralSource,
  updatePreferredCategories,
  completeOnboarding,
  changePassword,
} = require("../controllers/user.controller");
const { authenticateUser } = require("../middleware/middleware");

const router = express.Router();

// Public routes
router.post("/register", signup);
router.post("/login", loginUser);
router.post("/google-login", googleLogin); // New Google login endpoint
router.post("/reset-password/request", requestPasswordReset);
router.post("/reset-password", resetPassword);
// New route for updating referral source
router.post("/update-referral-source", updateReferralSource);
router.post("/update-preferred-categories", updatePreferredCategories);
router.post("/complete-onboarding", completeOnboarding);
router.put('/change-password', authenticateUser, changePassword);

module.exports = router;
