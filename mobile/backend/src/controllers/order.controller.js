const prisma = require('../../prisma/index');



const getOrderDetails = async(req, res)=>{
  const { orderId } = req.params; // Assuming the order ID is passed as a URL parameter

  try {
    // Fetch the order details from the database
    const order = await prisma.order.findUnique({
      where: {
        id: parseInt(orderId), // Convert orderId to an integer
      },
      include: {
        request: true, // Include related Request data
        traveler: true, // Include related User (traveler) data
        payment: true, // Include related Payment data
        pickup: true, // Include related Pickup data
        reviews: true, // Include related Review data
        notifications: true, // Include related Notification data
        goodsProcess: true, // Include related GoodsProcess data
      },
    });

    // If the order is not found, return a 404 error
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Return the order details as a JSON response
    res.status(200).json(order);
  } catch (error) {
    console.error('Error fetching order details:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}

module.exports = { getOrderDetails };
