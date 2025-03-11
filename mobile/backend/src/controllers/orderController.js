const prisma = require('../../prisma');

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
                createdAt: 'desc'
              }
            }
          }
        },
        traveler: true
      }
    });
    res.json({ success: true, data: orders });
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch orders' });
  }
};

// Get single order with all related info
const getOrderById = async (req, res) => {
  try {
    const order = await prisma.order.findUnique({
      where: { id: parseInt(req.params.id) },
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
                createdAt: 'desc'
              },
              include: {
                changedByUser: true
              }
            }
          }
        },
        traveler: true
      }
    });

    if (!order) {
      return res.status(404).json({ success: false, error: 'Order not found' });
    }

    res.json({ success: true, data: order });
  } catch (error) {
    console.error('Error fetching order:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch order' });
  }
};

// Create new order with process
const createOrder = async (req, res) => {
  try {
    const { requestId, travelerId, departureDate, arrivalDate, totalAmount } = req.body;
    
    // Check if order already exists for this request
    const existingOrder = await prisma.order.findUnique({
      where: { requestId: parseInt(requestId) }
    });
    
    if (existingOrder) {
      return res.status(400).json({ 
        success: false, 
        error: 'An order already exists for this request' 
      });
    }
    
    // Also update the request status to ACCEPTED
    await prisma.request.update({
      where: { id: parseInt(requestId) },
      data: { status: 'ACCEPTED' }
    });
    
    // Create order with GoodsProcess
    const order = await prisma.order.create({
      data: {
        requestId: parseInt(requestId),
        travelerId: parseInt(travelerId),
        departureDate: departureDate ? new Date(departureDate) : undefined,
        arrivalDate: arrivalDate ? new Date(arrivalDate) : undefined,
        totalAmount: totalAmount ? parseFloat(totalAmount) : undefined,
        paymentStatus: 'ON_HOLD',
        orderStatus: 'PENDING',
        goodsProcess: {
          create: {
            status: 'INITIALIZED',
            events: {
              create: {
                fromStatus: 'INITIALIZED',
                toStatus: 'INITIALIZED',
                changedByUserId: parseInt(travelerId),
                note: 'Order created'
              }
            }
          }
        }
      },
      include: {
        goodsProcess: true,
        request: {
          include: {
            goods: true,
            user: true
          }
        },
        traveler: true
      }
    });

    res.status(201).json({ success: true, data: order });
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({ success: false, error: 'Failed to create order' });
  }
};

// Update order
const updateOrder = async (req, res) => {
  try {
    const { departureDate, arrivalDate, trackingNumber, totalAmount, paymentStatus, orderStatus } = req.body;
    const orderId = parseInt(req.params.id);

    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: {
        departureDate: departureDate ? new Date(departureDate) : undefined,
        arrivalDate: arrivalDate ? new Date(arrivalDate) : undefined,
        trackingNumber,
        totalAmount: totalAmount ? parseFloat(totalAmount) : undefined,
        paymentStatus,
        orderStatus
      },
      include: {
        goodsProcess: true,
        request: {
          include: {
            goods: true,
            user: true
          }
        },
        traveler: true
      }
    });

    res.json({ success: true, data: updatedOrder });
  } catch (error) {
    console.error('Error updating order:', error);
    res.status(500).json({ success: false, error: 'Failed to update order' });
  }
};

module.exports = {
  getAllOrders,
  getOrderById,
  createOrder,
  updateOrder
};