const prisma = require("../../prisma/index");

// Fetch all categories
exports.getCategories = async (req, res) => {
  try {
    const categories = await prisma.category.findMany();
    res.status(200).json({
      success: true,
      data: categories,
    });
  } catch (error) {
    console.error("Error fetching categories:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch categories",
      error: error.message,
    });
  }
};
