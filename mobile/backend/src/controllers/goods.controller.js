const prisma = require("../../prisma/index");

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

// Create a new good
exports.createGood = async (req, res) => {
  const { name, size, weight, price, description, categoryId } = req.body;
  const { imageId } = req.file ? req.file : {}; // Assuming imageId is passed from the uploaded file

  try {
    const newGood = await prisma.goods.create({
      data: {
        name,
        size,
        weight,
        price,
        description,
        imageId,
        categoryId,
      },
    });
    res.status(201).json({
      success: true,
      data: newGood,
    });
  } catch (error) {
    console.error("Error creating good:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create good",
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