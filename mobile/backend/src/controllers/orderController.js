const prisma = require("../../prisma/index");

// Get all orders with their process info
const getAllOrders = async (req, res) => {
  try {
    const orders = await prisma.order.findMany({
      include: {
        request: {
          include: {
            goods: true,
            user: true,
          },
        },
        goodsProcess: {
          include: {
            events: {
              orderBy: {
                createdAt: "desc",
              },
            },
          },
        },
        traveler: {
          include: {
            profile: {
              include: {
                image: true,
              },
            },
          },
        },
        payment: true,
        pickup: true,
      },
    });
    res.json({ success: true, data: orders });
  } catch (error) {
    console.error("Error fetching orders:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch orders",
      details: error.message,
    });
  }
};

// Get single order with all related info
const getOrderById = async (req, res) => {
  try {
    const order = await prisma.order.findUnique({
      where: { id: parseInt(req.params.id) },
      include: {
        verificationImage: true,
        request: {
          include: {
            goods: true,
            user: true,
          },
        },
        goodsProcess: {
          include: {
            events: {
              orderBy: {
                createdAt: "desc",
              },
              include: {
                changedByUser: true,
              },
            },
          },
        },
        traveler: true,
      },
    });

    if (!order) {
      return res.status(404).json({ success: false, error: "Order not found" });
    }

    res.json({ success: true, data: order });
  } catch (error) {
    console.error("Error fetching order:", error);
    res.status(500).json({ success: false, error: "Failed to fetch order" });
  }
};

// Create new order with process
const createOrder = async (req, res) => {
  try {
    const { requestId, travelerId, departureDate, arrivalDate, totalAmount } =
      req.body;

    // Check if order already exists for this request
    const existingOrder = await prisma.order.findUnique({
      where: { requestId: parseInt(requestId) },
    });


    if (existingOrder) {
      return res.status(400).json({
        success: false,
        error: "An order already exists for this request",
      });
    }


    // Create order with GoodsProcess
    const order = await prisma.order.create({
      data: {
        requestId: parseInt(requestId),
        travelerId: parseInt(travelerId),
        departureDate: departureDate ? new Date(departureDate) : undefined,
        arrivalDate: arrivalDate ? new Date(arrivalDate) : undefined,
        totalAmount: totalAmount ? parseFloat(totalAmount) : undefined,
        paymentStatus: "ON_HOLD",
        orderStatus: "PENDING",
        goodsProcess: {
          create: {
            status: "PREINITIALIZED",
            events: {
              create: {
                fromStatus: "PREINITIALIZED",
                toStatus: "PREINITIALIZED",
                changedByUserId: parseInt(travelerId),
                note: "Order created",
              },
            },
          },
        },
      },
      include: {
        goodsProcess: true,
        request: {
          include: {
            goods: true,
            user: true,
          },
        },
        traveler: true,
      },
    });

    res.status(201).json({ success: true, data: order });
  } catch (error) {
    console.error("Error creating order:", error);
    res.status(500).json({ success: false, error: "Failed to create order" });
  }
};

// Update order
const updateOrder = async (req, res) => {
  try {
    const {
      departureDate,
      arrivalDate,
      trackingNumber,
      totalAmount,
      paymentStatus,
      orderStatus,
    } = req.body;
    const orderId = parseInt(req.params.id);

    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: {
        departureDate: departureDate ? new Date(departureDate) : undefined,
        arrivalDate: arrivalDate ? new Date(arrivalDate) : undefined,
        trackingNumber,
        totalAmount: totalAmount ? parseFloat(totalAmount) : undefined,
        paymentStatus,
        orderStatus,
      },
      include: {
        goodsProcess: true,
        request: {
          include: {
            goods: true,
            user: true,
          },
        },
        traveler: true,
      },
    });

    res.json({ success: true, data: updatedOrder });
  } catch (error) {
    console.error("Error updating order:", error);
    res.status(500).json({ success: false, error: "Failed to update order" });
  }
};

// Update this controller method to add authorization
const updateOrderStatus = async (req, res) => {
  try {
    const orderId = parseInt(req.params.id);
    const { status } = req.body;
    const userId = req.user.id; // Get the authenticated user's ID

    // First, get the order with related data
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
      include: {
        goodsProcess: true,
        request: true,
        traveler: true,
      },
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        error: "Order not found",
      });
    }

    // Check authorization based on the action
    if (status === "CANCELLED") {
      // Only the request owner (service owner) or the traveler can cancel
      if (order.request.userId !== userId && order.travelerId !== userId) {
        return res.status(403).json({
          success: false,
          error: "You are not authorized to cancel this order",
        });
      }
    } else {
      // For other status updates, only the traveler can update
      if (order.travelerId !== userId) {
        return res.status(403).json({
          success: false,
          error: "Only the traveler can update this order status",
        });
      }
    }

    // Start a transaction to handle the status update process
    const result = await prisma.$transaction(async (prisma) => {
      if (status === "CANCELLED") {
        // First, delete any events associated with the process
        await prisma.processEvent.deleteMany({
          where: { goodsProcessId: order.goodsProcess.id },
        });

        // Then delete the goods process
        await prisma.goodsProcess.delete({
          where: { id: order.goodsProcess.id },
        });

        // Update request status first
        await prisma.request.update({
          where: { id: order.requestId },
          data: {
            status: "PENDING",
          },
        });

        // Finally delete the order
        await prisma.order.delete({
          where: { id: orderId },
        });

        return {
          success: true,
          message: "Order cancelled and request restored to pending state",
        };
      }

      // Handle other status updates if not cancelled
      const updatedProcess = await prisma.goodsProcess.update({
        where: { orderId: orderId },
        data: {
          status: status,
          events: {
            create: {
              fromStatus: order.goodsProcess.status,
              toStatus: status,
              changedByUserId: userId,
              note: `Status updated to ${status}`,
            },
          },
        },
      });

      return {
        success: true,
        data: updatedProcess,
      };
    });

    res.json(result);
  } catch (error) {
    console.error("Error updating order status:", error);
    res.status(500).json({
      success: false,
      error: "Failed to update order status",
    });
  }
};

// Confirm order (for service owner)
const confirmOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;


    // Get the order
    const order = await prisma.order.findUnique({
      where: { id: parseInt(id) },
      include: { request: true, goodsProcess: true },
    });


    if (!order) {
      return res
        .status(404)
        .json({ success: false, message: "Order not found" });
    }


    // Check if user is the request owner
    if (order.request.userId !== userId) {
      return res.status(403).json({
        success: false,
        message: "Only the request owner can confirm this order",
      });
    }


    // Update order status - now we can use CONFIRMED
    const updatedOrder = await prisma.order.update({
      where: { id: parseInt(id) },
      data: { orderStatus: "CONFIRMED" },
    });


    // Update request status to ACCEPTED
    await prisma.request.update({
      where: { id: order.requestId },
      data: { status: "ACCEPTED" },
    });


    // Update goods process if needed
    if (order.goodsProcessId) {
      await prisma.goodsProcess.update({
        where: { id: order.goodsProcessId },
        data: {
          status: "CONFIRMED",
          events: {
            create: {
              fromStatus: order.goodsProcess.status,
              toStatus: "CONFIRMED",
              changedByUserId: userId,
              note: "Order confirmed by service owner",
            },
          },
        },
      });
    }


    res.json({ success: true, data: updatedOrder });
  } catch (error) {
    console.error("Error confirming order:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to confirm order" });
  }
};

const deleteOrder = async (req, res) => {
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
};
module.exports = {
  getAllOrders,
  getOrderById,
  createOrder,
  updateOrder,
  updateOrderStatus,
  deleteOrder,
  confirmOrder,
};
