const prisma = require("../../prisma/index");

// Fetch all goods posts
exports.getGoodsPosts = async (req, res) => {
  try {
    console.log("Fetching goods posts..."); // Debugging line
    const goodsPosts = await prisma.goodsPost.findMany({
      include: {
        traveler: {
          include: {
            profile: {
              select: {
                firstName: true,
                lastName: true,
                gender: true,
                image: {
                  select: {
                    url: true,
                  },
                },
              },
            },
          },
        },
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
      airportLocation: post.airportLocation,
      traveler: {
        firstName: post.traveler.profile.firstName,
        lastName: post.traveler.profile.lastName,
        gender: post.traveler.profile.gender,
        imageUrl: post.traveler.profile.image?.url,
      },
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
  const { title, content, travelerId, arrivalDate, availableKg, airportLocation, categoryId } = req.body;

  try {
    console.log("Creating goods post with data:", req.body); // Debug log
    
    // Validate required fields
    if (!title || !content || !travelerId) {
      return res.status(400).json({
        success: false,
        message: "Title, content, and travelerId are required fields",
      });
    }

    // Check if the traveler exists
    const traveler = await prisma.traveler.findUnique({
      where: { userId: parseInt(travelerId) },
    });

    if (!traveler) {
      return res.status(404).json({
        success: false,
        message: "Traveler not found",
        errorCode: "TRAVELER_NOT_FOUND"
      });
    }

    // Check if traveler is verified
    if (!traveler.isVerified) {
      return res.status(403).json({
        success: false,
        message: "Only verified travelers can create goods posts",
        errorCode: "TRAVELER_NOT_VERIFIED"
      });
    }

    // Check if the category exists
    if (categoryId) {
      const categoryExists = await prisma.category.findUnique({
        where: { id: parseInt(categoryId) },
      });

      if (!categoryExists) {
        return res.status(400).json({
          success: false,
          message: "Invalid category ID",
        });
      }
    }

    const newGoodsPost = await prisma.goodsPost.create({
      data: {
        title,
        content,
        travelerId: parseInt(travelerId),
        arrivalDate: new Date(arrivalDate),
        availableKg: parseFloat(availableKg),
        airportLocation,
        categoryId: categoryId ? parseInt(categoryId) : undefined,
      },
    });

    console.log("Created goods post:", newGoodsPost); // Debug log

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