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

    console.log("Request body:", req.body); // Log the entire request body
    console.log("Uploaded file:", req.file); // Log the uploaded file

    let imageId = null; // Initialize imageId

    if (req.file) {
        console.log(`File uploaded: ${req.file.originalname}`); // Log the name of the uploaded file
        console.log(`File path: ${req.file.path}`); // Log the path where the file is saved

        // Save the image metadata to the Media table
        const mediaData = {
            url: req.file.path, // Assuming the path is the URL
            type: 'IMAGE', // Get the MIME type of the file
            filename: req.file.filename, // Original filename
            // Add any other fields you want to save
            extension: "PNG", // Get the file extension from the MIME type
            size: req.file.size, // Get the size of the file
            width: 100, // Get the width of the image
            height: 100, // Get the height of the image

        };

        try {
            const media = await prisma.media.create({
                data: mediaData,
            });
            imageId = media.id; // Get the ID of the newly created media entry
        } catch (error) {
            console.error('Error saving media:', error);
            return res.status(500).json({ success: false, error: 'Failed to save media' });
        }
    } else {
        console.log("No file uploaded."); // Log if no file was uploaded
    }

    try {
        const updatedProfile = await prisma.profile.update({
            where: { userId: parseInt(userId) },
            data: { 
                firstName, 
                lastName, 
                bio, 
                country, 
                phoneNumber,
                imageId: imageId // Save the image ID if uploaded
            },
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