const prisma = require('../../prisma');

const createGoods = async (req, res) => {
  try {
    const {
      name,
      price,
      description,
      imageId,
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

    // Create goods record
    const goods = await prisma.goods.create({
      data: {
        name,
        price: parsedPrice,
        description,
        size,
        weight: weight ? parseFloat(weight) : null,
        isVerified,
        category: {
          connect: { id: categoryId }
        },
        ...(imageId && {
          image: {
            connect: { id: imageId }
          }
        })
      },
      include: {
        image: true,
        category: true
      }
    });

    res.status(201).json({
      success: true,
      data: goods
    });
  } catch (error) {
    console.error('Error creating goods:', error);
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

module.exports = {
  createGoods
};