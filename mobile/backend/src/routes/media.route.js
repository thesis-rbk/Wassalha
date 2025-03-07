const express = require('express');
const router = express.Router();
const upload = require('../middleware/multerMiddleware');
const { uploadMedia } = require('../controllers/media.controllers');

router.post('/upload', (req, res, next) => {
    console.log('Received upload request');
    upload.single('file')(req, res, (err) => {
        if (err) {
            console.error('Upload error:', err);
            return res.status(400).json({ success: false, error: err.message });
        }
        next();
    });
}, uploadMedia);

module.exports = router;
