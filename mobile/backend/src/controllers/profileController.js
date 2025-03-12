const prisma = require('../../prisma/index');
const multer = require('multer');
const upload = multer(); // This will handle multipart/form-data

const getProfile = async (req, res) => {
    const userId = req.params.id;

    try {
        const profile = await prisma.profile.findUnique({
            where: { userId: parseInt(userId) },
            include: {

                image: true, // Include the image relation
            },
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
    const { firstName, lastName, bio, country, phoneNumber } = req.body;

    console.log("Request body:", req.body);
    console.log("Uploaded file:", req.file);

    try {
        // Prepare update data object
        let updateData = {};

        // Only add fields that are provided in the request
        if (firstName !== undefined) updateData.firstName = firstName;
        if (lastName !== undefined) updateData.lastName = lastName;
        if (bio !== undefined) updateData.bio = bio;
        if (country !== undefined) updateData.country = country;
        if (phoneNumber !== undefined) updateData.phoneNumber = phoneNumber;

        // Handle image upload if present
        if (req.file) {
            console.log(`File uploaded: ${req.file.originalname}`);

            const mediaData = {
                url: req.file.path,
                type: 'IMAGE',
                filename: req.file.filename,
                extension: "PNG",
                size: req.file.size,
                width: 100,
                height: 100,
            };

            const media = await prisma.media.create({
                data: mediaData,
            });

            updateData.imageId = media.id;
        }

        // Update profile with only the provided fields
        const updatedProfile = await prisma.profile.update({
            where: { userId: parseInt(userId) },
            data: updateData,
            include: {
                image: true, // Include the image in response
            },
        });

        res.status(200).json({
            success: true,
            data: updatedProfile,
            message: 'Profile updated successfully'
        });

    } catch (error) {
        console.error('Error updating profile:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to update profile',
            message: error.message
        });
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