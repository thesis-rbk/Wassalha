const prisma = require("../../prisma/index");

// Fetch all orders with detailed information
exports.getOrders = async (req, res) => {
  try {
    const orders = await prisma.order.findMany({
      include: {
        traveler: {
          include: {
            profile: {
              include: {
                image: true, // Include the user's profile image
              },
            },
          },
        },
        request: true, // Include request details
        payment: true, // Include payment details if needed
        pickup: true, // Include pickup details if needed
        reviews: true, // Include reviews if needed
      },
    });
    res.status(200).json({
      success: true,
      data: orders,
    });
  } catch (error) {
    console.error("Error fetching orders:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch orders",
      error: error.message,
    });
  }
};

// Create a new order
exports.createOrder = async (req, res) => {
  const { requestId, travelerId, departureDate, arrivalDate, trackingNumber, totalAmount } = req.body;

  try {
    const newOrder = await prisma.order.create({
      data: {
        requestId,
        travelerId,
        departureDate,
        arrivalDate,
        trackingNumber,
        totalAmount,
      },
    });
    res.status(201).json({
      success: true,
      data: newOrder,
    });
  } catch (error) {
    console.error("Error creating order:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create order",
      error: error.message,
    });
  }
};

// Update an order
exports.updateOrder = async (req, res) => {
  const { id } = req.params;
  const { requestId, travelerId, departureDate, arrivalDate, trackingNumber, totalAmount } = req.body;

  try {
    const updatedOrder = await prisma.order.update({
      where: { id: parseInt(id) },
      data: {
        requestId,
        travelerId,
        departureDate,
        arrivalDate,
        trackingNumber,
        totalAmount,
      },
    });
    res.status(200).json({
      success: true,
      data: updatedOrder,
    });
  } catch (error) {
    console.error("Error updating order:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update order",
      error: error.message,
    });
  }
};

// Delete an order
exports.deleteOrder = async (req, res) => {
  const { id } = req.params;

  try {
    await prisma.order.delete({
      where: { id: parseInt(id) },
    });
    res.status(200).json({
      success: true,
      message: "Order deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting order:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete order",
      error: error.message,
    });
  }
}; 