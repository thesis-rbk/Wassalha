const prisma = require("../../prisma/index");

// Get all process details
const getAllProcessDetails = async (req, res) => {
  try {
    // Fetch all processes with related data
    const processes = await prisma.goodsProcess.findMany({
      include: {
        events: {
          orderBy: {
            createdAt: "desc", // Order events by creation date (newest first)
          },
          include: {
            changedByUser: true, // Include user who made the change
          },
        },
        order: {
          include: {
            request: {
              include: {
                goods: true, // Include goods data
                user: true, // Include user who made the request
              },
            },
            traveler: true, // Include traveler data
          },
        },
      },
    });

    // Return the list of processes (empty array is fine)
    res.json({ success: true, data: processes || [] });
  } catch (error) {
    console.error("Error fetching processes:", error);
    res
      .status(500)
      .json({ success: false, error: "Failed to fetch processes" });
  }
};

// Get process details for an order
const getProcessDetails = async (req, res) => {
  try {
    const process = await prisma.goodsProcess.findUnique({
      where: { orderId: parseInt(req.params.orderId) },
      include: {
        events: {
          orderBy: {
            createdAt: "desc",
          },
          include: {
            changedByUser: true,
          },
        },
        order: {
          include: {
            request: {
              include: {
                goods: true,
                user: true,
              },
            },
            traveler: true,
          },
        },
      },
    });

    if (!process) {
      return res
        .status(404)
        .json({ success: false, error: "Process not found" });
    }

    res.json({ success: true, data: process });
  } catch (error) {
    console.error("Error fetching process:", error);
    res.status(500).json({ success: false, error: "Failed to fetch process" });
  }
};

// Update process status
const updateProcessStatus = async (req, res) => {
  try {
    const { status, userId, note } = req.body;
    const orderId = parseInt(req.params.orderId);

    // Get current process
    const currentProcess = await prisma.goodsProcess.findUnique({
      where: { orderId },
    });

    if (!currentProcess) {
      return res
        .status(404)
        .json({ success: false, error: "Process not found" });
    }

    // Update process and create event
    const updatedProcess = await prisma.goodsProcess.update({
      where: { orderId },
      data: {
        status,
        updatedAt: new Date(),
        events: {
          create: {
            fromStatus: currentProcess.status,
            toStatus: status,
            changedByUserId: parseInt(userId),
            note,
            createdAt: new Date(),
          },
        },
      },
      include: {
        events: {
          orderBy: {
            createdAt: "desc",
          },
          include: {
            changedByUser: true,
          },
        },
        order: {
          include: {
            request: true,
            traveler: true,
          },
        },
      },
    });

    res.json({ success: true, data: updatedProcess });
  } catch (error) {
    console.error("Error updating process:", error);
    res.status(500).json({ success: false, error: "Failed to update process" });
  }
};

// Get process history/events
const getProcessEvents = async (req, res) => {
  try {
    const events = await prisma.processEvent.findMany({
      where: {
        goodsProcess: {
          orderId: parseInt(req.params.orderId),
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      include: {
        changedByUser: true,
        goodsProcess: true,
      },
    });

    res.json({ success: true, data: events });
  } catch (error) {
    console.error("Error fetching events:", error);
    res.status(500).json({ success: false, error: "Failed to fetch events" });
  }
};

module.exports = {
  getAllProcessDetails,
  getProcessDetails,
  updateProcessStatus,
  getProcessEvents,
};
