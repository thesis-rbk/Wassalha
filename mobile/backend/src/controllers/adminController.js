const prisma = require('../../prisma/index');

// Get all admins
const getAllAdmins = async (req, res) => {
  try {
    const admins = await prisma.user.findMany({
      where: {
        role: {
          in: ['ADMIN', 'SUPER_ADMIN']
        }
      },
      select: {
        id: true,
        email: true,
        role: true,
        profile: {
          include: {
            image: true
          }
        }
      }
    });
    res.status(200).json({ success: true, data: admins });
  } catch (error) {
    console.error("Error fetching admins:", error);
    res.status(500).json({ success: false, message: "Failed to fetch admins", error: error.message });
  }
};

const getAdminById = async (req, res) => {
  const { id } = req.params;
  try {
    const admin = await prisma.user.findUnique({
      where: { id: parseInt(id) },
      select: {
        id: true,
        email: true,
        role: true
      }
    });

    if (!admin || !['ADMIN', 'SUPER_ADMIN'].includes(admin.role)) {
      return res.status(404).json({ success: false, message: "Admin not found" });
    }

    res.status(200).json({ success: true, data: admin });
  } catch (error) {
    console.error("Error fetching admin:", error);
    res.status(500).json({ success: false, message: "Failed to fetch admin", error: error.message });
  }
};

// Create or invite a new admin
const createOrInviteAdmin = async (req, res) => {
  const { email, role } = req.body;
  const userId = req.user.id;

  try {
    // Check if the user is a superadmin
    const requestingUser = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (requestingUser.role !== 'SUPER_ADMIN') {
      return res.status(403).json({ success: false, message: "Only superadmins can create or invite admins" });
    }

    // Check if the user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      // Update existing user's role to admin
      const updatedUser = await prisma.user.update({
        where: { email },
        data: { role: 'ADMIN' }
      });

      return res.status(200).json({ success: true, message: "User role updated to admin", data: updatedUser });
    }

    // If user doesn't exist, invite them by creating a new user with 'admin' role
    const newUser = await prisma.user.create({
      data: {
        email,
        role: 'ADMIN'
      }
    });

    res.status(201).json({ success: true, data: newUser });
  } catch (error) {
    console.error("Error creating or inviting admin:", error);
    res.status(500).json({ success: false, message: "Failed to create or invite admin", error: error.message });
  }
};

// Remove an admin
const removeAdmin = async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  try {
    // Validate ID
    const adminId = parseInt(id);
    if (isNaN(adminId)) {
      return res.status(400).json({ 
        success: false, 
        message: "Invalid admin ID" 
      });
    }

    // Check if the requesting user exists and is a SUPER_ADMIN
    const requestingUser = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!requestingUser || requestingUser.role !== 'SUPER_ADMIN') {
      return res.status(403).json({ 
        success: false, 
        message: "Only Super Admins can remove admins" 
      });
    }

    // Check if the admin exists
    const adminToRemove = await prisma.user.findUnique({
      where: { id: adminId }
    });

    if (!adminToRemove) {
      return res.status(404).json({ 
        success: false, 
        message: "Admin not found" 
      });
    }

    if (adminToRemove.role === 'SUPER_ADMIN') {
      return res.status(403).json({ 
        success: false, 
        message: "Cannot remove SUPER_ADMIN users" 
      });
    }

    // Update the admin's role to USER
    const updatedUser = await prisma.user.update({
      where: { id: adminId },
      data: { role: 'USER' }
    });

    res.status(200).json({ 
      success: true, 
      message: "Admin successfully removed and converted to regular user",
      data: updatedUser
    });
  } catch (error) {
    console.error("Error removing admin:", error);
    res.status(500).json({ 
      success: false, 
      message: "Failed to remove admin", 
      error: error.message 
    });
  }
};

// Update an admin's role
const updateAdminRole = async (req, res) => {
  const { id } = req.params;
  const { newRole } = req.body;
  const userId = req.user.id;

  try {
    // Check if the user is a SUPER_ADMIN
    const requestingUser = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (requestingUser.role !== 'SUPER_ADMIN') {
      return res.status(403).json({ 
        success: false, 
        message: "Only Super Admins can update admin roles" 
      });
    }

    // Check if the admin exists and is not a SUPER_ADMIN
    const admin = await prisma.user.findUnique({
      where: { id: parseInt(id) }
    });

    if (!admin || admin.role === 'SUPER_ADMIN') {
      return res.status(404).json({ 
        success: false, 
        message: "Admin not found or cannot modify SUPER_ADMIN" 
      });
    }

    // Update the admin's role
    const updatedAdmin = await prisma.user.update({
      where: { id: parseInt(id) },
      data: { role: newRole }
    });

    res.status(200).json({ 
      success: true, 
      message: "Admin role updated successfully", 
      data: updatedAdmin 
    });
  } catch (error) {
    console.error("Error updating admin role:", error);
    res.status(500).json({ 
      success: false, 
      message: "Failed to update admin role", 
      error: error.message 
    });
  }
};

const promoteToAdmin = async (req, res) => {
  const { email } = req.body;
  const requestingUserId = req.user.id;

  try {
    // Check if the requesting user is a SUPER_ADMIN
    const requestingUser = await prisma.user.findUnique({
      where: { id: requestingUserId }
    });

    if (requestingUser.role !== 'SUPER_ADMIN') {
      return res.status(403).json({ 
        success: false, 
        message: "Only Super Admins can promote users to Admin" 
      });
    }

    // Check if the user exists
    const userToPromote = await prisma.user.findUnique({
      where: { email },
      include: {
        profile: true
      }
    });

    if (!userToPromote) {
      return res.status(404).json({ 
        success: false, 
        message: "User not found" 
      });
    }

    // Check if user is already an admin
    if (userToPromote.role === 'ADMIN' || userToPromote.role === 'SUPER_ADMIN') {
      return res.status(400).json({ 
        success: false, 
        message: "User is already an Admin or Super Admin" 
      });
    }

    // Check if user's profile is verified
    if (!userToPromote.profile?.isVerified) {
      return res.status(400).json({ 
        success: false, 
        message: "User must be verified before becoming an Admin" 
      });
    }

    // Promote user to Admin
    const updatedUser = await prisma.user.update({
      where: { email },
      data: { role: 'ADMIN' },
      include: {
        profile: {
          include: {
            image: true
          }
        }
      }
    });

    res.status(200).json({ 
      success: true, 
      message: "User successfully promoted to Admin",
      data: updatedUser 
    });
  } catch (error) {
    console.error("Error promoting user to admin:", error);
    res.status(500).json({ 
      success: false, 
      message: "Failed to promote user to Admin",
      error: error.message 
    });
  }
};

module.exports = {
  getAllAdmins,
  getAdminById,
  createOrInviteAdmin,
  removeAdmin,
  updateAdminRole,
  promoteToAdmin
};