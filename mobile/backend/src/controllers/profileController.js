const prisma = require('../../prisma/index');

const getProfile = async (req, res) => {
    const userId = req.params.id;

    try {
        const profile = await prisma.profile.findUnique({
            where: { userId: parseInt(userId) },
        });

        if (!profile) {
            return res.status(404).json({ error: 'Profile not found' });
        }

        res.status(200).json({ success: true, data: profile });
    } catch (error) {
        console.error('Error fetching profile:', error);
        res.status(500).json({ success: false, error: 'Failed to fetch profile' });
    }
};

const updateProfile = async (req, res) => {
    const userId = req.params.id;
    const { firstName, lastName, bio } = req.body;

    try {
        const updatedProfile = await prisma.profile.update({
            where: { userId: parseInt(userId) },
            data: { firstName, lastName, bio },
        });

        res.status(200).json({ success: true, data: updatedProfile });
    } catch (error) {
        console.error('Error updating profile:', error);
        res.status(500).json({ success: false, error: 'Failed to update profile' });
    }
};

const getUserProfile = async (userId) => {
    try {
        const userProfile = await prisma.user.findUnique({
            where: { id: userId },
            include: {
                profile: true, // Assuming 'profile' is the relation name in your Prisma schema
            },
        });

        if (userProfile) {
            const { email, name, profile } = userProfile;
            const { firstName, lastName, bio } = profile;

            console.log("Email:", email);
            console.log("Name:", name);
            console.log("First Name:", firstName);
            console.log("Last Name:", lastName);
            console.log("Bio:", bio);
        } else {
            console.log("User not found");
        }
    } catch (error) {
        console.error("Error fetching user profile:", error);
    }
};

// Call the function with the user ID
// Replace 11 with the actual user ID

module.exports = {
    getProfile,
    updateProfile,
    getUserProfile,
}; 