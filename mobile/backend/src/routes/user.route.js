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
  getUsers,
  verifyIdCard,
  verifySelfie,
  verifyCreditCard,
  submitQuestionnaire,
} = require("../controllers/user.controller");
const upload = require('../middleware/multerMiddleware');
const { authenticateUser } = require("../middleware/middleware");
const { getMessages } = require("../controllers/message.controller");

const router = express.Router();

// Public routes
router.post("/register",upload.single('image'), signup);
router.post("/login", loginUser);
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

module.exports = router;
