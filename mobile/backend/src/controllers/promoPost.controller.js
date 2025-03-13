const prisma = require("../../prisma/index");

// Fetch all promo posts
exports.getPromoPosts = async (req, res) => {
  try {
    const promoPosts = await prisma.promoPost.findMany({
      include: {
        publisher: { include: { profile: true } }, // Include publisher details
        category: true, // Include category details
      },
    });
    res.status(200).json({
      success: true,
      data: promoPosts,
    });
  } catch (error) {
    console.error("Error fetching promo posts:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch promo posts",
      error: error.message,
    });
  }
};

// Create a new promo post
exports.createPromoPost = async (req, res) => {
  const { title, content, publisherId, categoryId } = req.body;

  try {
    const newPromoPost = await prisma.promoPost.create({
      data: {
        title,
        content,
        publisherId,
        categoryId,
      },
    });
    res.status(201).json({
      success: true,
      data: newPromoPost,
    });
  } catch (error) {
    console.error("Error creating promo post:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create promo post",
      error: error.message,
    });
  }
};

// Update a promo post
exports.updatePromoPost = async (req, res) => {
  const { id } = req.params;
  const { title, content, publisherId, categoryId } = req.body;

  try {
    const updatedPromoPost = await prisma.promoPost.update({
      where: { id: parseInt(id) },
      data: {
        title,
        content,
        publisherId,
        categoryId,
      },
    });
    res.status(200).json({
      success: true,
      data: updatedPromoPost,
    });
  } catch (error) {
    console.error("Error updating promo post:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update promo post",
      error: error.message,
    });
  }
};

// Delete a promo post
exports.deletePromoPost = async (req, res) => {
  const { id } = req.params;

  try {
    // Check if promo post exists before attempting to delete
    const existingPost = await prisma.promoPost.findUnique({
      where: { id: parseInt(id) }
    });

    if (!existingPost) {
      return res.status(404).json({
        success: false,
        message: "Promo post not found"
      });
    }

    await prisma.promoPost.delete({
      where: { id: parseInt(id) },
    });

    res.status(200).json({
      success: true,
      message: "Promo post deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting promo post:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete promo post",
      error: error.message,
    });
  }
}; 