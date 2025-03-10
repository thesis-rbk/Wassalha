const prisma = require('../../prisma');

const createGoods = async (req, res) => {
  console.log('📥 Received goods creation request');
  console.log('📦 Request body:', req.body);
  console.log('🖼️ File received:', req.file ? 'Yes' : 'No');
  
  try {
    if (req.file) {
      console.log('📁 File details:', {
        filename: req.file.filename,
        mimetype: req.file.mimetype,
        size: req.file.size
      });
    }

    const {
      name,
      price,
      description,
      categoryId,
      size,
      weight,
      isVerified = false
    } = req.body;

    // Validate price
    const parsedPrice = parseFloat(price);
    if (isNaN(parsedPrice)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid price value'
      });
    }

    // Handle image file if uploaded
    let mediaRecord = null;
    if (req.file) {
      // Create media record
      mediaRecord = await prisma.media.create({
        data: {
          url: `${req.file.filename}`,
          type: 'IMAGE',
          mimeType: req.file.mimetype,
          filename: req.file.filename,
          size: req.file.size,
          // You can add width and height if you process the image
        }
      });
    }

    // Create goods record
    const goods = await prisma.goods.create({
      data: {
        name,
        price: parsedPrice,
        description,
        size,
        weight: weight ? parseFloat(weight) : null,
        isVerified: isVerified === 'true' ? true : false,
        category: {
          connect: { id: parseInt(categoryId) }
        },
        ...(mediaRecord && {
          image: {
            connect: { id: mediaRecord.id }
          }
        }),
        goodsUrl: mediaRecord ? `${req.file.filename}` : null
      },
      include: {
        image: true,
        category: true
      }
    });

    console.log('✅ Goods created successfully');
    res.status(201).json({
      success: true,
      data: goods
    });
  } catch (error) {
    console.error('❌ Error in createGoods:', error);
    console.error('Stack trace:', error.stack);
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

module.exports = {
  createGoods
};