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
      departureDate: post.departureDate,
      arrivalDate: post.arrivalDate,
      originLocation: post.originLocation,
      airportLocation: post.airportLocation,
      availableKg: post.availableKg,
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

// Fetch goods posts for a specific user
exports.getUserGoodsPosts = async (req, res) => {
  const { userId } = req.params;
  
  try {
    console.log(`Fetching goods posts for user ID: ${userId}`); 
    
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "User ID is required",
      });
    }
    
    const goodsPosts = await prisma.goodsPost.findMany({
      where: {
        travelerId: parseInt(userId),
      },
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
        category: true,
      },
      orderBy: {
        createdAt: 'desc', // Most recent posts first
      },
    });

    // Map the results to include scalar fields directly
    const formattedGoodsPosts = goodsPosts.map(post => ({
      id: post.id,
      title: post.title,
      content: post.content,
      departureDate: post.departureDate,
      arrivalDate: post.arrivalDate,
      originLocation: post.originLocation,
      airportLocation: post.airportLocation,
      availableKg: post.availableKg,
      traveler: {
        firstName: post.traveler.profile.firstName,
        lastName: post.traveler.profile.lastName,
        gender: post.traveler.profile.gender,
        imageUrl: post.traveler.profile.image?.url,
      },
      category: post.category,
    }));

    console.log(`Fetched ${formattedGoodsPosts.length} goods posts for user ${userId}`); 
    
    res.status(200).json({
      success: true,
      data: formattedGoodsPosts,
    });
  } catch (error) {
    console.error(`Error fetching goods posts for user ${userId}:`, error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch user's goods posts",
      error: error.message,
    });
  }
};

// Create a new goods post
exports.createGoodsPost = async (req, res) => {
  const { 
    title, 
    content, 
    travelerId, 
    departureDate, 
    arrivalDate, 
    availableKg, 
    originLocation, 
    airportLocation, 
    categoryId 
  } = req.body;

  try {
    console.log("Creating goods post with data:", req.body); // Debug log
    
    // Validate required fields
    if (!title || !content || !travelerId) {
      return res.status(400).json({
        success: false,
        message: "Title, content, and travelerId are required fields",
      });
    }

    // IMPORTANT: In this schema, travelerId directly refers to a User ID
    // First check if the user exists
    const user = await prisma.user.findUnique({
      where: { id: parseInt(travelerId) },
      include: {
        traveler: true
      }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
        errorCode: "USER_NOT_FOUND"
      });
    }

    // Check if the user is a traveler
    if (!user.traveler) {
      return res.status(403).json({
        success: false,
        message: "User is not a registered traveler",
        errorCode: "NOT_A_TRAVELER"
      });
    }

    // Check if traveler is verified
    if (!user.traveler.isVerified) {
      return res.status(403).json({
        success: false,
        message: "Only verified travelers can create goods posts",
        errorCode: "TRAVELER_NOT_VERIFIED"
      });
    }

    // Check if the category exists when provided
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

    // Create the goods post - travelerId refers to the userId directly
    const newGoodsPost = await prisma.goodsPost.create({
      data: {
        title,
        content,
        travelerId: parseInt(travelerId), // This is the User ID
        departureDate: departureDate ? new Date(departureDate) : undefined,
        arrivalDate: arrivalDate ? new Date(arrivalDate) : undefined,
        originLocation,
        airportLocation,
        availableKg: parseFloat(availableKg),
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
    console.error("Error details:", error.message);
    if (error.code) {
      console.error("Error code:", error.code);
    }
    
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