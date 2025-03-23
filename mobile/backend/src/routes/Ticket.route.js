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
    getTicketMessagesByTicketId,
    getTicketsByUserId
} = require('../controllers/Ticket.Controllers');
const upload = require('../middleware/multerMiddleware');

router.post('/create', authenticateUser, createTicket);
router.get('/', authenticateAdmin, getTickets);
router.get('/get/:id', authenticateUser, getTicketById);
router.get('/all', authenticateUser, getTicketsByUserId);
router.put('/:id/status', authenticateAdmin, updateTicketStatus);
router.post('/:id/messages', authenticateUser, addTicketMessage);
router.post('/:id/messages/admin', authenticateAdmin, addTicketMessage);
router.delete('/:id', authenticateAdmin, deleteTicket);
router.get('/:id/messages', authenticateUser,getTicketMessagesByTicketId);
module.exports = router;
