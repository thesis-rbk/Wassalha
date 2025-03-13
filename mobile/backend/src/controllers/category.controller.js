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

// Update a category
exports.updateCategory = async (req, res) => {
  const { id, name, description } = req.body;
  try {
    const updatedCategory = await prisma.category.update({
      where: { id: id },
      data: { name, description },
    });
    res.status(200).json({
      success: true,
      data: updatedCategory,
    });
  } catch (error) {
    console.error("Error updating category:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update category",
      error: error.message,
    });
  }
};

// Disable a category
exports.disableCategory = async (req, res) => {
  const { id } = req.body;
  try {
    const disabledCategory = await prisma.category.update({
      where: { id: id },
      data: { isDisabled: true },
    });
    res.status(200).json({
      success: true,
      data: disabledCategory,
    });
  } catch (error) {
    console.error("Error disabling category:", error);
    res.status(500).json({
      success: false,
      message: "Failed to disable category",
      error: error.message,
    });
  }
};

// Create a category
exports.createCategory = async (req, res) => {
  const { name, description } = req.body;
  try {
    const newCategory = await prisma.category.create({
      data: {
        name,
        description,
        isDisabled: false,
      },
    });
    res.status(201).json({
      success: true,
      data: newCategory,
    });
  } catch (error) {
    console.error("Error creating category:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create category",
      error: error.message,
    });
  }
};
