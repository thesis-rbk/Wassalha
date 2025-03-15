const express = require('express');
const router = express.Router();
const { authenticateUser, authenticateAdmin } = require('../middleware/middleware');
const {
    createTicket,
    getTickets,
    getTicketById,
    updateTicketStatus,
    addTicketMessage,
    deleteTicket,
} = require('../controllers/Ticket.Controllers');

router.post('/', authenticateUser, createTicket);
router.get('/', authenticateAdmin, getTickets);
router.get('/:id', authenticateAdmin, getTicketById);
router.put('/:id/status', authenticateAdmin, updateTicketStatus);
router.post('/:id/messages', authenticateUser, addTicketMessage);
router.delete('/:id', authenticateAdmin, deleteTicket);
module.exports = router;
