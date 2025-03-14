const express = require('express');
const router = express.Router();
const { authenticateUser,authenticateAdmin } = require('../middleware/middleware');
const {
    createTicket,
    getTickets,
    getTicketById,
    updateTicketStatus,
    addTicketMessage,
} = require('../controllers/Ticket.Controllers');

router.post('/', authenticateUser, createTicket);
router.get('/', authenticateUser, getTickets);
router.get('/:id', authenticateUser, getTicketById);
router.put('/:id/status', authenticateAdmin, updateTicketStatus);
router.post('/:id/messages', authenticateUser, addTicketMessage);

module.exports = router;
