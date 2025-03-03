const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const uploadMedia = async (req, res) => {
  try {
    // Check if file exists
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    // Create media record in database
    const media = await prisma.media.create({
      data: {
        url: `/uploads/${req.file.filename}`,
        type: 'IMAGE',
        mimeType: req.file.mimetype,
        filename: req.file.filename,
        size: req.file.size,
        // Add optional fields if available
        width: req.file.width,
        height: req.file.height
      }
    });

    // Return success response
    return res.status(200).json({
      success: true,
      data: {
        mediaId: media.id,
        url: media.url,
        filename: media.filename
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