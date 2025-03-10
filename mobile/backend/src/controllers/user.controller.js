const prisma = require("../../prisma/index");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const { OAuth2Client } = require("google-auth-library");
const crypto = require("crypto");
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const googleClient = new OAuth2Client(GOOGLE_CLIENT_ID);
const saltRounds = parseInt(process.env.SALT_ROUNDS, 10) || 10;

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

const signup = async (req, res) => {
  const { name, email, password, role } = req.body;

  try {
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
    /*if (!/\d/.test(password)) {
      return res.status(400).json({ error: 'Password must contain at least one number' });
    }*/

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return res.status(409).json({ error: "Email is already in use" });
    }

    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: role || 'USER',
      },
    });

    // Automatically create profile for new user
    await prisma.profile.create({
      data: {
        firstName: newUser.name,
        lastName: "",
        User: {
          connect: {
            id: newUser.id
          }
        },
      },
    });

    res.status(201).json({
      message: "User registered successfully",
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
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
      { id: user.id, email: user.email, role: user.role },
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
        role: user.role,
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
    });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    // Check if the user is an admin
    if (user.role !== 'ADMIN') {
      return res.status(403).json({ error: "Access denied. Admins only." });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
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
      },
    });
  } catch (error) {
    console.error("Admin login error:", error);
    res.status(500).json({ error: "Something went wrong during admin login" });
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
  const { id, name, role, firstName, lastName } = req.body;

  try {
    if (!id) {
      return res.status(400).json({ error: "User ID is required" });
    }

    // Update user name and role
    const updatedUser = await prisma.user.update({
      where: { id },
      data: {
        name,
        role,
      },
    });

    // Update profile firstName and lastName
    const updatedProfile = await prisma.profile.update({
      where: { userId: id },
      data: {
        firstName,
        lastName,
      },
    });

    res.status(200).json({
      message: "User updated successfully",
      user: updatedUser,
      profile: updatedProfile,
    });
  } catch (error) {
    console.error("Update user error:", error);
    res.status(500).json({ error: "Failed to update user" });
  }
};

// Delete a user
const deleteUser = async (req, res) => {
  const { id } = req.params;

  try {
    // First delete the profile (due to foreign key constraints)
    await prisma.profile.delete({
      where: { userId: parseInt(id) }
    });

    // Then delete the user
    await prisma.user.delete({
      where: { id: parseInt(id) }
    });

    res.status(200).json({ 
      success: true,
      message: "User and associated profile deleted successfully" 
    });
  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(500).json({ 
      success: false,
      error: "Failed to delete user",
      details: error.message 
    });
  } finally {
    await prisma.$disconnect();
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
};
