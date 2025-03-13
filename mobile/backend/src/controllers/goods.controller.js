const prisma = require('../../prisma/index');

<<<<<<< HEAD
const createGoods = async (req, res) => {
=======
exports.createGoods = async (req, res) => {
>>>>>>> 1c8050f2f326b7b4e6eec9aeffeed1c8a1ebb9aa
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

<<<<<<< HEAD
module.exports = {
  createGoods
};
=======


// Fetch all goods with detailed information
exports.getGoods = async (req, res) => {
  try {
    const goods = await prisma.goods.findMany({
      include: {
        image: true, // Include media details
        category: true, // Include category details
      },
    });
    res.status(200).json({
      success: true,
      data: goods.map(good => ({
        ...good,
        isVerified: good.isVerified, // Ensure isVerified is included
      })),
    });
  } catch (error) {
    console.error("Error fetching goods:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch goods",
      error: error.message,
    });
  }
};



// Update a good
exports.updateGood = async (req, res) => {
  const { id } = req.params;
  const { name, size, weight, price, description, categoryId } = req.body;

  try {
    const updatedGood = await prisma.goods.update({
      where: { id: parseInt(id) },
      data: {
        name,
        size,
        weight,
        price,
        description,
        categoryId,
      },
    });
    res.status(200).json({
      success: true,
      data: updatedGood,
    });
  } catch (error) {
    console.error("Error updating good:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update good",
      error: error.message,
    });
  }
};

// Delete a good
exports.deleteGood = async (req, res) => {
  const { id } = req.params;

  try {
    // Check if good exists before attempting to delete
    const existingGood = await prisma.goods.findUnique({
      where: { id: parseInt(id) }
    });

    if (!existingGood) {
      return res.status(404).json({
        success: false,
        message: "Good not found"
      });
    }

    await prisma.goods.delete({
      where: { id: parseInt(id) },
    });

    res.status(200).json({
      success: true,
      message: "Good deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting good:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete good",
      error: error.message,
    });
  }
};

// Verify a good
exports.verifyGood = async (req, res) => {
  const { id } = req.params;

  try {
    const updatedGood = await prisma.goods.update({
      where: { id: parseInt(id) },
      data: { isVerified: true },
    });

    res.status(200).json({
      success: true,
      message: "Good verified successfully",
      data: updatedGood,
    });
  } catch (error) {
    console.error("Error verifying good:", error);
    res.status(500).json({
      success: false,
      message: "Failed to verify good",
      error: error.message,
    });
  }
}; 
>>>>>>> 1c8050f2f326b7b4e6eec9aeffeed1c8a1ebb9aa
