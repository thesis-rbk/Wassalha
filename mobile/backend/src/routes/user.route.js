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
} = require("../controllers/user.controller");
const upload = require('../middleware/multerMiddleware');
const { getMessages } = require("../controllers/message.controller");
const { authenticateUser, authenticateAdmin, authenticateUserOrAdmin } = require("../middleware/middleware");
const { PrismaClient } = require('@prisma/client');

const router = express.Router();
const prisma = new PrismaClient();

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
router.post('/:id/profile-picture', upload.single('image'), async (req, res) => {
  try {
    const userId = parseInt(req.params.id);
    const file = req.file;

    if (!file) {
      return res.status(400).json({
        success: false,
        message: "No profile picture uploaded"
      });
    }

    console.log(`Processing profile picture for user: ${userId}`);
    console.log(`File details:`, {
      originalname: file.originalname,
      mimetype: file.mimetype,
      size: file.size,
      path: file.path
    });

    // Create media record for the uploaded image
    const mediaData = {
      url: file.path,
      type: 'IMAGE',
      filename: file.originalname,
      size: file.size,
      width: 150, // Default dimensions for profile pictures
      height: 150
    };

    // Start a transaction to ensure both operations succeed or fail together
    const result = await prisma.$transaction(async (tx) => {
      // Create the media record
      const media = await tx.media.create({
        data: mediaData,
      });

      // Find the user's profile or create one if it doesn't exist
      const existingProfile = await tx.profile.findUnique({
        where: { userId: userId }
      });

      let profile;
      if (existingProfile) {
        // Update existing profile with new image
        profile = await tx.profile.update({
          where: { userId: userId },
          data: { 
            imageId: media.id 
          },
          include: {
            image: true
          }
        });
      } else {
        // Get user details to create profile if needed
        const user = await tx.user.findUnique({
          where: { id: userId }
        });

        if (!user) {
          throw new Error("User not found");
        }

        // Create new profile with image
        profile = await tx.profile.create({
          data: {
            userId: userId,
            firstName: user.name.split(' ')[0] || user.name,
            lastName: user.name.split(' ').slice(1).join(' ') || '',
            country: "OTHER",
            imageId: media.id,
            isAnonymous: false,
            isBanned: false,
            isVerified: false,
            isOnline: false
          },
          include: {
            image: true
          }
        });
      }

      return { media, profile };
    });

    // Return success response
    return res.status(200).json({
      success: true,
      message: "Profile picture uploaded successfully",
      data: {
        profile: result.profile,
        image: {
          id: result.media.id,
          url: result.media.url
        }
      }
    });

  } catch (error) {
    console.error('Error uploading profile picture:', error);
    return res.status(500).json({
      success: false,
      message: "Failed to upload profile picture",
      error: error.message
    });
  }
});

// User CRUD routes
router.get("/", getUsers); // Get all users
router.get("/demographics", authenticateAdmin, getUserDemographics); // Get user demographics
router.get("/:id", getUserById); // Get a single user
router.put("/:id", updateUser); // Update user
router.put("/:id/ban", authenticateAdmin, banUser); // Ban/Unban a user
router.put("/:id/unban", authenticateAdmin, unbanUser); // Unban a user
router.delete("/:id", authenticateAdmin, deleteUser); // Only admins can delete users
router.put("/:id/verify-profile", authenticateAdmin, verifyUserProfile);

module.exports = router;
