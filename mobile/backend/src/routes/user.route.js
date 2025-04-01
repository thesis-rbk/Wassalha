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
  verifyIdCard,
  verifySelfie,
  verifyCreditCard,
  submitQuestionnaire,
  verifyUserProfile,
  getUserDemographics,
  getProfileImage,
  updateProfilePicture,
} = require("../controllers/user.controller");
const upload = require('../middleware/multerMiddleware');
const { getMessages } = require("../controllers/message.controller");
const { authenticateUser, authenticateAdmin, authenticateUserOrAdmin } = require("../middleware/middleware");


const router = express.Router();


// Public routes
router.post("/register",upload.single('image'), signup);
router.post("/login", loginUser);
router.post("/admin/login", loginAdmin);
router.post("/google-login", googleLogin); // Regular Google login endpoint
router.post("/admin/google-login", googleLogin); // Admin Google login (uses same function with path detection)
router.post("/reset-password/request", requestPasswordReset);
router.post("/reset-password", resetPassword);
// Add admin password reset routes using the same functions
router.post("/admin/reset-password/request", requestPasswordReset);
router.post("/admin/reset-password", resetPassword);
// New route for updating referral source
router.post("/update-referral-source", updateReferralSource);
router.post("/update-preferred-categories", updatePreferredCategories);
router.post("/complete-onboarding", completeOnboarding);
router.put("/change-password", authenticateUser, changePassword);
router.get("/messages", getMessages);
router.post(
  '/verify-id/:id',
  authenticateUser,
  upload.single('idCard'),
  verifyIdCard
);
router.post(
  '/verify-selfie/:id',
  authenticateUser,
  upload.single('selfie'),
  verifySelfie
);
router.post(
  '/verify-credit-card/:id',
  authenticateUser,
  verifyCreditCard
);
router.post(
  '/submit-questionnaire/:id',
  authenticateUser,
  submitQuestionnaire
);

// Add profile picture upload route
router.post('/:id/profile-picture', upload.single('image'), updateProfilePicture);

// User CRUD routes
router.get("/", getUsers); // Get all users
router.get("/demographics", authenticateAdmin, getUserDemographics); // Get user demographics
router.get("/:id", getUserById); // Get a single user
router.put("/:id", updateUser); // Update user
router.put("/:id/ban", authenticateAdmin, banUser); // Ban/Unban a user
router.put("/:id/unban", authenticateAdmin, unbanUser); // Unban a user
router.delete("/:id", authenticateAdmin, deleteUser); // Only admins can delete users
router.put("/:id/verify-profile", authenticateAdmin, verifyUserProfile);

// Add new route for getting user profile image
router.get("/:id/profile-image", getProfileImage);

module.exports = router;
