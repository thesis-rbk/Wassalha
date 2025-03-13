const prisma = require("../../prisma/index");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const { OAuth2Client } = require("google-auth-library");
const crypto = require("crypto");
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const googleClient = new OAuth2Client(GOOGLE_CLIENT_ID);
const saltRounds = parseInt(process.env.SALT_ROUNDS, 10) || 10;
const multer = require('multer');
const upload = multer();

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const generateRandomCode = () => {
  return Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit code
};

// Signup with Multer middleware applied
const signup = async (req, res) => {
  const { name, email, password } = req.body;

  try {
    // Validation
    if (!name || !email || !password) {
      return res
        .status(400)
        .json({ error: "Name, email, and password are required" });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: "Invalid email format" });
    }

    if (password.length < 8) {
      return res
        .status(400)
        .json({ error: "Password must be at least 8 characters long" });
    }
    if (!/[A-Z]/.test(password)) {
      return res
        .status(400)
        .json({ error: "Password must contain at least one uppercase letter" });
    }

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return res.status(409).json({ error: "Email is already in use" });
    }

    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Handle image upload (same logic as updateProfile)
    let imageId = null; // Initialize imageId
    if (req.file) {
      console.log(`File uploaded: ${req.file.originalname}`); // Log the name of the uploaded file
      console.log(`File path: ${req.file.path}`); // Log the path where the file is saved

      // Save the image metadata to the Media table
      const mediaData = {
        url: req.file.path, // Assuming the path is the URL (adjust if serving differently)
        type: 'IMAGE', // Static value as in updateProfile
        filename: req.file.filename, // Generated filename from Multer
        extension: "PNG", // Static as in updateProfile (could be dynamic from req.file.mimetype)
        size: req.file.size, // File size in bytes
        width: 100, // Static as in updateProfile (could use image processing for accuracy)
        height: 100, // Static as in updateProfile
      };

      const media = await prisma.media.create({
        data: mediaData,
      });
      imageId = media.id; // Get the ID of the newly created media entry
    } else {
      console.log("No file uploaded."); // Log if no file was uploaded
    }

    // Create the user
    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
      },
    });

    // Create profile with image if uploaded (same as updateProfile logic)
    await prisma.profile.create({
      data: {
        firstName: newUser.name,
        lastName: "",
        userId: newUser.id,
        imageId: imageId, // Save the image ID if uploaded
      },
    // Create user with transaction to ensure both user and profile are created
    const result = await prisma.$transaction(async (prisma) => {
      const newUser = await prisma.user.create({
        data: {
          name,
          email,
          password: hashedPassword,
        },
      });

      // Create profile with proper data structure
      const profile = await prisma.profile.create({
        data: {
          userId: newUser.id,
          firstName: name.split(' ')[0] || name, // Get first name or full name
          lastName: name.split(' ').slice(1).join(' ') || '', // Get rest of name or empty string
          country: "OTHER",
          isAnonymous: false,
          isBanned: false,
          isVerified: false,
          isOnline: false,
        },
      });

      return { newUser, profile };
    });

    res.status(201).json({
      message: "User registered successfully",
      user: {
        id: result.newUser.id,
        name: result.newUser.name,
        email: result.newUser.email,
      },
    });
  } catch (error) {
    console.error("Signup error:", error);
    res.status(500).json({ error: "Something went wrong during signup" });
  } finally {
    await prisma.$disconnect();
  }
};

const loginUser = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required" });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET || "secretkey",
      { expiresIn: "1h" }
    );

    res.status(200).json({
      message: "Login successful",
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        hasCompletedOnboarding: user.hasCompletedOnboarding,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: "Something went wrong during login" });
  } finally {
    await prisma.$disconnect();
  }
};


const loginAdmin = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required" });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        profile: {
          include: {
            image: true
          }
        }
      }
    });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    // Check if the user is an admin or super admin
    if (user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN') {
      return res.status(403).json({ error: "Access denied. Admin privileges required." });
    }

    const token = jwt.sign(
      { 
        id: user.id, 
        email: user.email, 
        role: user.role 
      },
      process.env.JWT_SECRET || "secretkey",
      { expiresIn: "1h" }
    );

    res.status(200).json({
      message: "Admin login successful",
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        profile: user.profile ? {
          image: user.profile.image
        } : null
      },
    });
  } catch (error) {
    console.error("Admin login error:", error);
    res.status(500).json({ error: "Something went wrong during admin login" });
  } finally {
    await prisma.$disconnect();
  }
};

const googleLogin = async (req, res) => {
  const { idToken } = req.body;
  console.log("google token id", idToken);

  if (!idToken) {
    return res.status(400).json({ error: "Google ID token is required" });
  }

  try {
    console.log("google client", GOOGLE_CLIENT_ID);
    const ticket = await googleClient.verifyIdToken({
      idToken,
      audience: GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();

    const googleId = payload["sub"];
    const email = payload["email"];
    const name = payload["name"];

    let user = await prisma.user.findFirst({
      where: {
        OR: [{ googleId }, { email }],
      },
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          name,
          email,
          googleId,
        },
      });
    } else if (!user.googleId) {
      user = await prisma.user.update({
        where: { id: user.id },
        data: { googleId },
      });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET,
      {
        expiresIn: "1h",
      }
    );

    res.status(200).json({
      message: "Google login successful",
      token,
      user: { id: user.id, name: user.name, email: user.email },
    });
  } catch (error) {
    console.error("Google login error:", error);
    res.status(401).json({ error: "Invalid Google token" });
  } finally {
    await prisma.$disconnect();
  }
};

const requestPasswordReset = async (req, res) => {
  const { email } = req.body;

  try {
    if (!email) {
      return res.status(400).json({ error: "Email is required" });
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: "Invalid email format" });
    }

    const user = await prisma.user.findUnique({
      where: { email },
    });
    if (!user) {
      return res.status(404).json({ error: "No user found with this email" });
    }

    const resetToken = generateRandomCode();
    const resetTokenExpiry = new Date(Date.now() + 3600000);

    await prisma.user.update({
      where: { email },
      data: {
        resetToken,
        resetTokenExpiry,
      },
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Password Reset Code",
      text: `Your password reset code is: ${resetToken}. This code expires in 1 hour.`,
      html: `<p>Your password reset code is: <strong>${resetToken}</strong>. This code expires in 1 hour.</p>`,
    };

    await transporter.sendMail(mailOptions);
    res.status(200).json({ message: "Password reset code sent to your email" });
  } catch (error) {
    console.error("Request password reset error:", error);
    res.status(500).json({ error: "Something went wrong" });
  } finally {
    await prisma.$disconnect();
  }
};

const resetPassword = async (req, res) => {
  const { email, code, newPassword } = req.body;

  try {
    if (!email || !code || !newPassword) {
      return res
        .status(400)
        .json({ error: "Email, code, and new password are required" });
    }

    if (newPassword.length < 8) {
      return res
        .status(400)
        .json({ error: "Password must be at least 8 characters long" });
    }
    if (!/[A-Z]/.test(newPassword)) {
      return res
        .status(400)
        .json({ error: "Password must contain at least one uppercase letter" });
    }
    if (!/\d/.test(newPassword)) {
      return res
        .status(400)
        .json({ error: "Password must contain at least one number" });
    }

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user || user.resetToken !== code || !user.resetTokenExpiry) {
      return res.status(400).json({ error: "Invalid or expired code" });
    }

    if (new Date() > user.resetTokenExpiry) {
      return res.status(400).json({ error: "Reset code has expired" });
    }

    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

    await prisma.user.update({
      where: { email },
      data: {
        password: hashedPassword,
        resetToken: null,
        resetTokenExpiry: null,
      },
    });

    res.status(200).json({ message: "Password reset successfully" });
  } catch (error) {
    console.error("Reset password error:", error);
    res.status(500).json({ error: "Something went wrong" });
  } finally {
    await prisma.$disconnect();
  }
};

const updateReferralSource = async (req, res) => {
  const { userId, referralSource } = req.body;

  try {
    // Update the referralSource for the user's profile
    const updatedProfile = await prisma.profile.update({
      where: { userId },
      data: { referralSource },
    });

    res.status(200).json({
      success: true,
      message: "Referral source updated successfully",
      data: updatedProfile,
    });
  } catch (error) {
    console.error("Error updating referral source:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update referral source",
      error: error.message,
    });
  }
};

// Update preferred categories
const updatePreferredCategories = async (req, res) => {
  const { userId, preferredCategories } = req.body;

  try {
    const updatedProfile = await prisma.profile.update({
      where: { userId },
      data: { preferredCategories },
    });

    res.status(200).json({
      success: true,
      message: "Preferred categories updated successfully",
      data: updatedProfile,
    });
  } catch (error) {
    console.error("Error updating preferred categories:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update preferred categories",
      error: error.message,
    });
  }
};

// Mark onboarding as completed
const completeOnboarding = async (req, res) => {
  const { userId } = req.body;

  try {
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { hasCompletedOnboarding: true },
    });

    res.status(200).json({
      success: true,
      message: "Onboarding completed successfully",
      data: updatedUser,
    });
  } catch (error) {
    console.error("Error completing onboarding:", error);
    res.status(500).json({
      success: false,
      message: "Failed to complete onboarding",
      error: error.message,
    });
  }
};

const changePassword = async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const userId = req.user.id; // Get user ID from the authenticated user

  try {
    const user = await prisma.user.findUnique({ where: { id: userId } });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: "Current password is incorrect" });
    }

    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);
    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
    });

    res.status(200).json({ message: "Password changed successfully" });
  } catch (error) {
    console.error("Error changing password:", error);
    res.status(500).json({ error: "Failed to change password" });
  }
};

// Fetch users and their profiles, including the user's image
const getUsers = async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      where: {
        role: 'USER' // Add this line to filter only users with 'user' role
      },
      include: {
        profile: {
          include: {
            image: {
              select: {
                id: true,
                url: true,
                type: true
              }
            }
          }
        }
      }
    });

    // Transform the data to ensure image URLs are complete
    const transformedUsers = users.map(user => ({
      ...user,
      profile: user.profile ? {
        ...user.profile,
        image: user.profile.image ? {
          ...user.profile.image,
          url: user.profile.image.url.startsWith('http') 
            ? user.profile.image.url 
            : `${process.env.NEXT_PUBLIC_API_URL}/${user.profile.image.url}`
        } : null
      } : null
    }));

    res.status(200).json({
      success: true,
      data: transformedUsers,
    });
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch users",
      error: error.message,
    });
  }
};

// Get a single user by ID, including the user's profile data
const getUserById = async (req, res) => {
  const { id } = req.params;

  try {
    const user = await prisma.user.findUnique({
      where: { id: parseInt(id) },
      include: {
        profile: {
          include: {
            image: true,
          }
        },
        reviewsGiven: {
          include: {
            reviewer: {
              include: {
                profile: {
                  include: {
                    image: true
                  }
                }
              }
            }
          }
        },
        reviewsReceived: {
          include: {
            reviewer: {
              include: {
                profile: {
                  include: {
                    image: true
                  }
                }
              }
            }
          }
        }
      },
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.status(200).json({
      ...user,
      profile: {
        ...user.profile,
        bio: user.profile?.bio || null,
        review: user.profile?.review || null,
        isBanned: user.profile?.isBanned || false,
        verified: user.profile?.verified || false,
      },
      reviewsGiven: user.reviewsGiven,
      reviewsReceived: user.reviewsReceived
    });
  } catch (error) {
    console.error("Error fetching user:", error);
    res.status(500).json({ error: "Failed to fetch user" });
  }
};

// Update a user and their profile
const updateUser = async (req, res) => {
  const { 
    id,
    // User model fields
    name,
    email,
    phoneNumber,
    role,
    hasCompletedOnboarding,
    isSponsor,
    serviceProviderId,
    googleId,
    password,

    // Profile model fields
    firstName,
    lastName,
    bio,
    country,
    imageId,
    gender,
    review,
    isAnonymous,
    isBanned,
    isVerified,
    isOnline,
    preferredCategories,
    referralSource
  } = req.body;

  try {
    if (!id) {
      return res.status(400).json({ error: "User ID is required" });
    }

    // Use transaction to ensure both user and profile updates succeed or fail together
    const result = await prisma.$transaction(async (prisma) => {
      // First update user data
      const userUpdateData = {
        ...(name && { name }),
        ...(email && { email }),
        ...(phoneNumber && { phoneNumber }),
        ...(role && { role }),
        ...(hasCompletedOnboarding !== undefined && { hasCompletedOnboarding }),
        ...(isSponsor !== undefined && { isSponsor }),
        ...(serviceProviderId && { serviceProviderId }),
        ...(googleId && { googleId }),
        ...(password && { password: await bcrypt.hash(password, saltRounds) }),
      };

      const updatedUser = await prisma.user.update({
        where: { id },
        data: userUpdateData,
      });

      // Check if profile exists
      const existingProfile = await prisma.profile.findUnique({
        where: { userId: id },
      });

      // Prepare profile data ensuring required fields
      const profileData = {
        ...(firstName && { firstName }),
        ...(lastName && { lastName }),
        ...(bio && { bio }),
        ...(country && { country }),
        ...(phoneNumber && { phoneNumber }),
        ...(imageId && { imageId }),
        ...(gender && { gender }),
        ...(review && { review }),
        ...(isAnonymous !== undefined && { isAnonymous }),
        ...(isBanned !== undefined && { isBanned }),
        ...(isVerified !== undefined && { isVerified }),
        ...(isOnline !== undefined && { isOnline }),
        ...(preferredCategories && { preferredCategories }),
        ...(referralSource && { referralSource }),
      };

      let updatedProfile;
      if (existingProfile) {
        // Update existing profile
        updatedProfile = await prisma.profile.update({
          where: { userId: id },
          data: profileData,
          include: {
            image: true,
          },
        });
      } else {
        // Create new profile if it doesn't exist
        updatedProfile = await prisma.profile.create({
          data: {
            ...profileData,
            userId: id,
            firstName: firstName || updatedUser.name,
            lastName: lastName || "",
            country: country || "OTHER",
            isAnonymous: isAnonymous || false,
            isBanned: isBanned || false,
            isVerified: isVerified || false,
            isOnline: isOnline || false,
          },
          include: {
            image: true,
          },
        });
      }

      return { updatedUser, updatedProfile };
    });

    res.status(200).json({
      success: true,
      message: "User updated successfully",
      data: {
        user: result.updatedUser,
        profile: result.updatedProfile,
      },
    });
  } catch (error) {
    console.error("Update user error:", error);
    res.status(500).json({ 
      success: false,
      error: "Failed to update user", 
      details: error.message 
    });
  } finally {
    await prisma.$disconnect();
  }
};

// Delete a user
const deleteUser = async (req, res) => {
  const { id } = req.params;

  try {
    if (!id) {
      return res.status(400).json({
        success: false,
        error: "User ID is required"
      });
    }

    const userId = parseInt(id);
    if (isNaN(userId)) {
      return res.status(400).json({
        success: false,
        error: "Invalid user ID format"
      });
    }

    // Start a transaction
    await prisma.$transaction(async (prisma) => {
      // Check if user exists first
      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: {
          profile: {
            include: { image: true }
          }
        }
      });

      if (!user) {
        throw new Error('User not found');
      }

      try {
        // 1. Delete profile and image first
        if (user.profile) {
          if (user.profile.image) {
            await prisma.media.delete({
              where: { id: user.profile.image.id }
            }).catch(error => {
              console.error("Error deleting media:", error);
              // Continue with deletion even if media deletion fails
            });
          }

          await prisma.profile.delete({
            where: { userId }
          }).catch(error => {
            console.error("Error deleting profile:", error);
            throw error;
          });
        }

        // 2. Delete user preferences and settings
        await Promise.all([
          prisma.userPreference.deleteMany({ where: { userId } }),
          prisma.userCategory.deleteMany({ where: { userId } })
        ]).catch(error => {
          console.error("Error deleting user preferences:", error);
          throw error;
        });

        // 3. Delete reputation data
        await Promise.all([
          prisma.reputationTransaction.deleteMany({
            where: { reputation: { userId } }
          }),
          prisma.reputation.deleteMany({ where: { userId } })
        ]).catch(error => {
          console.error("Error deleting reputation data:", error);
          throw error;
        });

        // 4. Delete notifications
        await prisma.notification.deleteMany({
          where: { userId }
        }).catch(error => {
          console.error("Error deleting notifications:", error);
          throw error;
        });

        // 5. Delete service provider data
        await prisma.serviceProvider.deleteMany({
          where: { userId }
        }).catch(error => {
          console.error("Error deleting service provider data:", error);
          throw error;
        });

        // 6. Delete messages and chats
        await Promise.all([
          prisma.message.deleteMany({
            where: {
              OR: [
                { senderId: userId },
                { receiverId: userId }
              ]
            }
          }),
          prisma.chat.deleteMany({
            where: {
              OR: [
                { requesterId: userId },
                { providerId: userId }
              ]
            }
          })
        ]).catch(error => {
          console.error("Error deleting messages and chats:", error);
          throw error;
        });

        // 7. Delete reviews
        await prisma.review.deleteMany({
          where: {
            OR: [
              { reviewerId: userId },
              { reviewedId: userId }
            ]
          }
        }).catch(error => {
          console.error("Error deleting reviews:", error);
          throw error;
        });

        // 8. Delete posts
        await Promise.all([
          prisma.goodsPost.deleteMany({ where: { travelerId: userId } }),
          prisma.promoPost.deleteMany({ where: { publisherId: userId } })
        ]).catch(error => {
          console.error("Error deleting posts:", error);
          throw error;
        });

        // 9. Delete orders and related processes
        await Promise.all([
          prisma.processEvent.deleteMany({ where: { changedByUserId: userId } }),
          prisma.goodsProcess.deleteMany({
            where: {
              order: {
                OR: [
                  { buyerId: userId },
                  { sellerId: userId }
                ]
              }
            }
          }),
          prisma.order.deleteMany({
            where: {
              OR: [
                { buyerId: userId },
                { sellerId: userId }
              ]
            }
          })
        ]).catch(error => {
          console.error("Error deleting orders and processes:", error);
          throw error;
        });

        // 10. Delete payments
        await prisma.payment.deleteMany({
          where: {
            OR: [
              { payerId: userId },
              { receiverId: userId }
            ]
          }
        }).catch(error => {
          console.error("Error deleting payments:", error);
          throw error;
        });

        // 11. Finally delete the user
        await prisma.user.delete({
          where: { id: userId }
        }).catch(error => {
          console.error("Error deleting user:", error);
          throw error;
        });

      } catch (error) {
        console.error("Transaction error:", error);
        throw error;
      }
    });

    res.status(200).json({
      success: true,
      message: "User and all associated data deleted successfully"
    });

  } catch (error) {
    console.error("Error in delete operation:", error);
    
    if (error.message === 'User not found') {
      return res.status(404).json({
        success: false,
        error: "User not found"
      });
    }

    if (error.code === 'P2003') {
      return res.status(400).json({
        success: false,
        error: "Cannot delete user due to existing references",
        details: error.message,
        hint: "Please try again or contact support if the issue persists"
      });
    }

    res.status(500).json({
      success: false,
      error: "Failed to delete user",
      details: error.message,
      hint: "An unexpected error occurred during deletion"
    });
  } finally {
    try {
      await prisma.$disconnect();
    } catch (error) {
      console.error("Error disconnecting from database:", error);
    }
  }
};

const banUser = async (req, res) => {
  const { id } = req.params; // Get user ID from request parameters

  try {
      // Ensure the ID is converted to an integer
      const userId = parseInt(id, 10);
      
      // Update the profile to set isBanned to true
      const updatedProfile = await prisma.profile.update({
          where: { userId: userId }, 
          data: { isBanned: true }, // Always set isBanned to true
      });

    res.status(200).json({
      message: "User has been banned successfully.",
      profile: updatedProfile, // Return the updated profile
    });
  } catch (error) {
    console.error("Error banning user:", error);
    res.status(500).json({ error: "Failed to ban user" });
  }
};

const unbanUser = async (req, res) => {
    const { id } = req.params; // Get user ID from request parameters

    try {
        // Ensure the ID is converted to an integer
        const userId = parseInt(id, 10);
        
        // Update the profile to set isBanned to false
        const updatedProfile = await prisma.profile.update({
            where: { userId: userId }, 
            data: { isBanned: false }, // Set isBanned to false
        });

        res.status(200).json({
            message: "User has been unbanned successfully.",
            profile: updatedProfile, // Return the updated profile
        });
    } catch (error) {
        console.error("Error unbanning user:", error);
        res.status(500).json({ error: "Failed to unban user" });
    }
};

const verifyIdCard = async (req, res) => {
  try {
    const userId = parseInt(req.params.id);
    const file = req.file;

    if (!file) {
      return res.status(400).json({
        success: false,
        message: "No ID Card image uploaded"
      });
    }

    // Hash the file path/content for security
    const fileHash = crypto
      .createHash('sha256')
      .update(file.path)
      .digest('hex');

    // Update or create ServiceProvider record
    const serviceProvider = await prisma.serviceProvider.upsert({
      where: {
        userId: userId
      },
      update: {
        idCard: fileHash,
        isVerified: false // Requires manual verification
      },
      create: {
        userId: userId,
        type: "SUBSCRIBER",
        idCard: fileHash,
        isVerified: false,
        subscriptionLevel: "BASIC"
      }
    });

    res.status(200).json({
      success: true,
      message: "ID Card uploaded successfully",
      data: {
        idCard: fileHash,
        isVerified: serviceProvider.isVerified
      }
    });

  } catch (error) {
    console.error('Error in ID verification:', error);
    res.status(500).json({
      success: false,
      message: "Failed to process ID Card",
      error: error.message
    });
  }
};

const verifySelfie = async (req, res) => {
  try {
    const userId = parseInt(req.params.id);
    const file = req.file;

    if (!file) {
      return res.status(400).json({
        success: false,
        message: "No selfie uploaded"
      });
    }

    // Hash the file path/content for security
    const fileHash = crypto
      .createHash('sha256')
      .update(file.path)
      .digest('hex');

    // Update ServiceProvider record with selfie
    const serviceProvider = await prisma.serviceProvider.update({
      where: {
        userId: userId
      },
      data: {
        selfie: fileHash,
      }
    });

    res.status(200).json({
      success: true,
      message: "Selfie uploaded successfully",
      data: {
        selfie: fileHash
      }
    });

  } catch (error) {
    console.error('Error in selfie verification:', error);
    res.status(500).json({
      success: false,
      message: "Failed to process selfie",
      error: error.message
    });
  }
};

const verifyCreditCard = async (req, res) => {
  try {
    const userId = req.params.id;
    const { cardholderName, last4, brand, expiryMonth, expiryYear } = req.body;

    // Validate the user exists
    const user = await prisma.user.findUnique({
      where: { id: parseInt(userId) },
      include: { serviceProvider: true }
    });

    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }

    // Create or update service provider record
    let serviceProvider;
    if (user.serviceProvider) {
      serviceProvider = await prisma.serviceProvider.update({
        where: { id: user.serviceProvider.id },
        data: {
          creditCard: `${brand} **** **** **** ${last4}`,
          isVerified: true,
          updatedAt: new Date()
        }
      });
    } else {
      serviceProvider = await prisma.serviceProvider.create({
        data: {
          userId: parseInt(userId),
          type: 'SPONSOR',
          creditCard: `${brand} **** **** **** ${last4}`,
          isVerified: true,
          updatedAt: new Date()
        }
      });

      // Update user to be a sponsor
      await prisma.user.update({
        where: { id: parseInt(userId) },
        data: {
          isSponsor: true,
          serviceProviderId: serviceProvider.id.toString()
        }
      });
    }

    res.status(200).json({
      success: true,
      message: 'Credit card verified successfully',
      data: {
        isVerified: true,
        last4
      }
    });
  } catch (error) {
    console.error('Error verifying credit card:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to verify credit card',
      error: error.message
    });
  }
};

const submitQuestionnaire = async (req, res) => {
  try {
    const userId = req.params.id;
    const { answers } = req.body;

    // Update service provider with questionnaire answers
    const serviceProvider = await prisma.serviceProvider.update({
      where: { userId: parseInt(userId) },
      data: {
        questionnaireAnswers: answers, // Store directly in the JSON field
        isVerified: false // Set verification status
      }
    });

    res.status(200).json({
      success: true,
      message: 'Questionnaire submitted successfully',
      data: {
        isVerified: serviceProvider.isVerified
      }
    });
  } catch (error) {
    console.error('Error submitting questionnaire:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to submit questionnaire',
      error: error.message
    });
  }
};

const verifyUserProfile = async (req, res) => {
  const { id } = req.params;

  try {
    const updatedProfile = await prisma.profile.update({
      where: { userId: parseInt(id) },
      data: { isVerified: true },
    });

    res.status(200).json({
      success: true,
      message: "User profile verified successfully",
      data: updatedProfile,
    });
  } catch (error) {
    console.error("Error verifying user profile:", error);
    res.status(500).json({
      success: false,
      message: "Failed to verify user profile",
      error: error.message,
    });
  }
};

module.exports = {
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
  getUsers,
  getUserById,
  updateUser,
  deleteUser,
  banUser,
  unbanUser,
  verifyIdCard,
  verifySelfie,
  verifyCreditCard,
  submitQuestionnaire,
  verifyUserProfile
};
