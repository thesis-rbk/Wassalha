const multer = require('multer');
const fs = require('fs');
const path = require('path');

// Define the upload directory
const uploadDir = path.join(__dirname, '../uploads');
console.log("Upload directory:", uploadDir);

// Ensure the upload directory exists
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
    console.log("Created upload directory:", uploadDir); // Log creation of directory
} else {
    console.log("Upload directory already exists:", uploadDir); // Log if directory exists
}

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        console.log(`Uploading file: ${file.originalname} to ${uploadDir}`); // Log the file being uploaded
        cb(null, uploadDir); // Specify the directory to save uploaded files
    },
    filename: function (req, file, cb) {
        const filename = `${Date.now()}-${file.originalname}`;
        console.log(`Saving file as: ${filename}`); // Log the filename being saved
        cb(null, filename); // Append timestamp to the filename
    },
});

// Initialize Multer
 
module.exports = multer({
    storage: storage,
    limits: { fileSize: 5000000 }, // Example limit of 5MB
    fileFilter: function (req, file, cb) {
        console.log(`File filter: ${file.originalname}, Type: ${file.mimetype}`); // Log file type
        cb(null, true); // Accept all files (you can add your own logic here)
    },
});

