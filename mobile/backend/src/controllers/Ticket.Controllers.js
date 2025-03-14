const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Create a new ticket
const createTicket = async (req, res) => {
    try {
        const { title, description } = req.body;
        const userId = req.user.id; // Assuming you have user info in req.user from auth middleware

        const ticket = await prisma.ticket.create({
            data: {
                title,
                description,
                userId,
            },
            include: {
                user: true,
            },
        });

        res.status(201).json({
            success: true,
            data: ticket,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error creating ticket',
            error: error.message,
        });
    }
};

// Get all tickets (admin) or user's tickets
const getTickets = async (req, res) => {
    try {
        const { role, id: userId } = req.user;

        const tickets = await prisma.ticket.findMany({
            where: role === 'USER' ? { userId } : undefined,
            include: {
                user: true,
                messages: {
                    include: {
                        sender: true,
                    },
                },
            },
            orderBy: {
                createdAt: 'desc',
            },
        });

        res.status(200).json({
            success: true,
            data: tickets,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching tickets',
            error: error.message,
        });
    }
};

// Get single ticket by ID
const getTicketById = async (req, res) => {
    try {
        const { id } = req.params;
        const { role, id: userId } = req.user;

        const ticket = await prisma.ticket.findUnique({
            where: { id: parseInt(id) },
            include: {
                user: true,
                messages: {
                    include: {
                        sender: true,
                    },
                },
            },
        });

        if (!ticket) {
            return res.status(404).json({
                success: false,
                message: 'Ticket not found',
            });
        }

        // Check if user has access to this ticket
        if (role === 'USER' && ticket.userId !== userId) {
            return res.status(403).json({
                success: false,
                message: 'Access denied',
            });
        }

        res.status(200).json({
            success: true,
            data: ticket,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching ticket',
            error: error.message,
        });
    }
};

// Update ticket status
const updateTicketStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        const { role } = req.user;

        // Only admins can update ticket status
        if (role === 'USER') {
            return res.status(403).json({
                success: false,
                message: 'Only admins can update ticket status',
            });
        }

        const ticket = await prisma.ticket.update({
            where: { id: parseInt(id) },
            data: { status },
            include: {
                user: true,
            },
        });

        res.status(200).json({
            success: true,
            data: ticket,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error updating ticket status',
            error: error.message,
        });
    }
};

// Add message to ticket
const addTicketMessage = async (req, res) => {
    try {
        const { id } = req.params;
        const { content } = req.body;
        const senderId = req.user.id;

        // First get the ticket to find the user to receive the message
        const ticket = await prisma.ticket.findUnique({
            where: { id: parseInt(id) },
            include: { user: true }
        });

        if (!ticket) {
            return res.status(404).json({
                success: false,
                message: 'Ticket not found'
            });
        }

        // Determine receiver (if sender is ticket owner, receiver is admin, and vice versa)
        const receiverId = ticket.userId === senderId 
            ? (await prisma.user.findFirst({ where: { role: 'ADMIN' } })).id 
            : ticket.userId;

        const message = await prisma.message.create({
            data: {
                content,
                senderId,
                receiverId,
                chatId: 0, // Required by schema, but not used for tickets
                type: 'TICKET',
                ticketId: parseInt(id),
            },
            include: {
                sender: true,
            },
        });

        res.status(201).json({
            success: true,
            data: message,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error adding message',
            error: error.message,
        });
    }
};

const deleteTicket = async (req, res) => {
    try {
        const { id } = req.params;
        
        await prisma.ticket.delete({
            where: { id: parseInt(id) },
        });

        res.status(200).json({
            success: true,
            message: 'Ticket deleted successfully',
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error deleting ticket',
            error: error.message,
        });
    }
};

module.exports = {
    createTicket,
    getTickets,
    getTicketById,
    updateTicketStatus,
    addTicketMessage,
    deleteTicket,
};
