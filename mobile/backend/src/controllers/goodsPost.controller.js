const prisma = require("../../prisma/index");

// Fetch all goods posts
exports.getGoodsPosts = async (req, res) => {
  try {
    console.log("Fetching goods posts..."); // Debugging line
    const goodsPosts = await prisma.goodsPost.findMany({
      include: {
        traveler: { include: { profile: true } }, // Include traveler details
        category: true, // Include category details
      },
    });

    // Map the results to include scalar fields directly
    const formattedGoodsPosts = goodsPosts.map(post => ({
      id: post.id,
      title: post.title,
      content: post.content,
      arrivalDate: post.arrivalDate,
      availableKg: post.availableKg,
      phoneNumber: post.phoneNumber,
      airportLocation: post.airportLocation,
      traveler: post.traveler,
      category: post.category,
    }));

    console.log("Fetched goods posts:", formattedGoodsPosts); // Debugging line
    res.status(200).json({
      success: true,
      data: formattedGoodsPosts,
    });
  } catch (error) {
    console.error("Error fetching goods posts:", error); // Log the error
    res.status(500).json({
      success: false,
      message: "Failed to fetch goods posts",
      error: error.message,
    });
  }
};

// Create a new goods post
exports.createGoodsPost = async (req, res) => {
  const { title, content, travelerId } = req.body;
  const { imageId } = req.file ? req.file : {}; // Assuming imageId is passed from the uploaded file

  try {
    const newGoodsPost = await prisma.goodsPost.create({
      data: {
        title,
        content,
        imageId,
        travelerId,
      },
    });
    res.status(201).json({
      success: true,
      data: newGoodsPost,
    });
  } catch (error) {
    console.error("Error creating goods post:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create goods post",
      error: error.message,
    });
  }
};

// Update a goods post
exports.updateGoodsPost = async (req, res) => {
  const { id } = req.params;
  const { title, content, travelerId } = req.body;

  try {
    const updatedGoodsPost = await prisma.goodsPost.update({
      where: { id: parseInt(id) },
      data: {
        title,
        content,
        travelerId,
      },
    });
    res.status(200).json({
      success: true,
      data: updatedGoodsPost,
    });
  } catch (error) {
    console.error("Error updating goods post:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update goods post",
      error: error.message,
    });
  }
};

// Delete a goods post
exports.deleteGoodsPost = async (req, res) => {
  const { id } = req.params;

  try {
    // Check if goods post exists before attempting to delete
    const existingPost = await prisma.goodsPost.findUnique({
      where: { id: parseInt(id) }
    });

    if (!existingPost) {
      return res.status(404).json({
        success: false,
        message: "Goods post not found"
      });
    }

    await prisma.goodsPost.delete({
      where: { id: parseInt(id) },
    });

    res.status(200).json({
      success: true,
      message: "Goods post deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting goods post:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete goods post",
      error: error.message,
    });
  }
}; 