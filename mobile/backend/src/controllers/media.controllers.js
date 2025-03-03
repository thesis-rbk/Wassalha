const prisma = require('../../prisma');
const path = require('path');

const uploadMedia = async (req, res) => {
  try {
    // Check if file exists (Multer adds the file to req.file)
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    // Get file extension without the dot
    const extension = path.extname(req.file.filename).substring(1).toUpperCase();

    // Create media record in database matching your schema
    const media = await prisma.media.create({
      data: {
        url: `/uploads/${req.file.filename}`,
        type: 'IMAGE', // This matches your MediaType enum
        mimeType: req.file.mimetype,
        extension: extension === 'JPG' ? 'JPEG' : extension, // Convert to match FileExtension enum
        filename: req.file.filename,
        size: parseFloat(req.file.size) // Convert to Float as per schema
      }
    });

    return res.status(201).json({
      success: true,
      data: {
        id: media.id,
        url: media.url,
        type: media.type,
        filename: media.filename,
        size: media.size
      }
    });
  } catch (error) {
    console.error('Upload error:', error);
    return res.status(500).json({
      success: false,
      message: 'Error uploading file',
      error: error.message
    });
  }
};

module.exports = {
  uploadMedia
};