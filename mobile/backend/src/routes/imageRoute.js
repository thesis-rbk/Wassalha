const express = require('express');
const profileController = require('../controllers/profileController');
const upload = require('../middleware/multerMiddleware');
const router = express.Router();

// Route for updating profile image (single upload)
router.put('/profile/:id/upload', upload.single('image'), profileController.updateProfile);

// Example route for multiple file uploads
// router.post('/profile/:id/uploads', upload.array('images'), (req, res) => {
//     console.log('Uploaded files:', req.files);
//     res.status(200).json({ success: true, files: req.files });
// });

module.exports = router;
