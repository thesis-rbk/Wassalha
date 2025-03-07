const prisma = require('../../prisma');
const path = require('path');

const uploadMedia = async (req, res) => {
  try {
    console.log('Processing upload in controller');
    // Check if file exists (Multer adds the file to req.file)
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    console.log('File details:', req.file);
    console.log('Body details:', req.body);

    // Get file extension without the dot
    const extension = path.extname(req.file.filename).substring(1).toUpperCase();

    // 1. Create media record
    const media = await prisma.media.create({
      data: {
        url: `/api/uploads/${req.file.filename}`,
        type: 'IMAGE', // This matches your MediaType enum
        mimeType: req.file.mimetype,
        extension: extension === 'JPG' ? 'JPEG' : extension, // Convert to match FileExtension enum
        filename: req.file.filename,
        size: req.file.size
      }
    });

    console.log('Created media:', media);

    // 2. Update the existing goods record with the new media ID
    if (req.body.goodsId) {
      const updatedGoods = await prisma.goods.update({
        where: {
          id: parseInt(req.body.goodsId)
        },
        data: {
          imageId: media.id
        },
        include: {
          image: true
        }
      });

      console.log('Updated goods:', updatedGoods);

      return res.status(201).json({
        success: true,
        data: {
          id: media.id,
          url: `/api/uploads/${req.file.filename}`,
          filename: req.file.filename,
          goods: updatedGoods
        }
      });
    }

    console.log('Created media record:', media);

    return res.status(201).json({
      success: true,
      data: {
        id: media.id,
        url: `/api/uploads/${req.file.filename}`,
        filename: req.file.filename
      }
    });
  } catch (error) {
    console.error('Controller error:', error);
    return res.status(500).json({
      success: false,
      message: 'Error processing upload',
      error: error.message
    });
  }
};

module.exports = {
  uploadMedia
};