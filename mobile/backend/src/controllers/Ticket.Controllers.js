const prisma = require("../../prisma/index");

// Create a new ticket
const createTicket = async (req, res) => {
    try {
        const { title, description, category } = req.body;
        // Log for debugging
        console.log('Creating ticket:', { title, description, category, userId: req.user?.id });
        
        if (!req.user || !req.user.id) {
            return res.status(401).json({
                success: false,
                message: 'User not authenticated'
            });
        }

        // Validate required fields
        if (!title || !description || !category) {
            return res.status(400).json({
                success: false,
                message: 'Title, description, and category are required'
            });
        }

        const ticket = await prisma.ticket.create({
            data: {
                title,
                description,
                userId: req.user.id,
                status: 'PENDING', // Matches TicketStatus enum
                category,         // New field added
            },
            include: {
                user: true
            }
        });

        res.status(201).json({
            success: true,
            data: ticket
        });
    } catch (error) {
        console.error('Ticket creation error:', error);
        res.status(500).json({
            success: false,
            message: 'Error creating ticket',
            error: error.message
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
                messages: { // Changed from 'messages' (Message) to 'messages' (TicketMessage)
                    include: {
                        sender: true,
                        media: true // Include media for ticket messages
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
                messages: { // Changed to TicketMessage
                    include: {
                        sender: true,
                        media: true // Include media
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
        if (role !== 'ADMIN') { // Changed to stricter check
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
        const { content, mediaIds } = req.body; // Added mediaIds for multiple media attachments
        const senderId = req.user.id;
        const isAdmin = req.user.role === 'ADMIN';

        // Validate ticket existence
        const ticket = await prisma.ticket.findUnique({
            where: { id: parseInt(id) },
        });

        if (!ticket) {
            return res.status(404).json({
                success: false,
                message: 'Ticket not found'
            });
        }

        // Check authorization
        if (!isAdmin && ticket.userId !== senderId) {
            return res.status(403).json({
                success: false,
                message: 'You are not authorized to add messages to this ticket'
            });
        }

        // Create the ticket message
        const message = await prisma.ticketMessage.create({
            data: {
                ticketId: parseInt(id),
                senderId,
                content,
                isAdmin,
                media: mediaIds && mediaIds.length > 0 ? {
                    connect: mediaIds.map(id => ({ id: parseInt(id) }))
                } : undefined,
            },
            include: {
                sender: true,
                media: true,
            },
        });

        // Update ticket's updatedAt timestamp
        await prisma.ticket.update({
            where: { id: parseInt(id) },
            data: { updatedAt: new Date() },
        });

        res.status(201).json({
            success: true,
            data: message,
        });
    } catch (error) {
        console.error('Error adding message:', error);
        res.status(500).json({
            success: false,
            message: 'Error adding message',
            error: error.message,
        });
    }
};

// Delete ticket
const deleteTicket = async (req, res) => {
    try {
        const { id } = req.params;
        const { role, id: userId } = req.user;

        // Only admins or ticket owners can delete
        const ticket = await prisma.ticket.findUnique({
            where: { id: parseInt(id) },
        });

        if (!ticket) {
            return res.status(404).json({
                success: false,
                message: 'Ticket not found',
            });
        }

        if (role !== 'ADMIN' && ticket.userId !== userId) {
            return res.status(403).json({
                success: false,
                message: 'Access denied',
            });
        }

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
const getTicketMessagesByTicketId = async (req, res) => {
    try {
        const { id } = req.params; // ticketId from URL
        const { role, id: userId } = req.user;

        // Validate ticket existence and user access
        const ticket = await prisma.ticket.findUnique({
            where: { id: parseInt(id) },
        });

        if (!ticket) {
            return res.status(404).json({
                success: false,
                message: 'Ticket not found',
            });
        }

        // Check if user has access (ticket owner or admin)
        if (role !== 'ADMIN' && ticket.userId !== userId) {
            return res.status(403).json({
                success: false,
                message: 'Access denied',
            });
        }

        // Fetch all messages for the ticket
        const messages = await prisma.ticketMessage.findMany({
            where: { ticketId: parseInt(id) },
            include: {
                sender: {
                    select: {
                        id: true,
                        name: true,
                        email: true, // Adjust fields as needed
                    },
                },
                media: true, // Include attached media
            },
            orderBy: {
                createdAt: 'asc', // Oldest to newest
            },
        });

        res.status(200).json({
            success: true,
            data: messages,
        });
    } catch (error) {
        console.error('Error fetching ticket messages:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching ticket messages',
            error: error.message,
        });
    }
};
const getTicketsByUserId = async (req, res) => {
    try {
        const userId = req.user.id;

        const tickets = await prisma.ticket.findMany({
            where: { userId },
            include: {
                user: true,
                messages: {
                    include: {
                        sender: true,
                        media: true
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        res.status(200).json({
            success: true,
            data: tickets
        });
    } catch (error) {
        console.error('Error fetching tickets by userId:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching tickets',
            error: error.message
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
    getTicketMessagesByTicketId,
    getTicketsByUserId
};