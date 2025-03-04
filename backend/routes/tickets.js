const express = require('express');
const router = express.Router();
const ticketController = require('../controllers/ticketController');
const authMiddleware = require('../middleware/authMiddleware');

// Middleware d'authentification
router.use(authMiddleware);

// Routes
router.post('/', ticketController.createTicket);
router.get('/server/:serverId', ticketController.getServerTickets);
router.get('/:ticketId', ticketController.getTicketById);
router.post('/:ticketId/message', ticketController.addMessage);
router.put('/:ticketId/assign', ticketController.assignTicket);
router.put('/:ticketId/category', ticketController.updateTicketCategory);
router.put('/:ticketId/close', ticketController.closeTicket);
router.put('/:ticketId/reopen', ticketController.reopenTicket);
router.post('/:ticketId/note', ticketController.addTicketNote);
router.get('/server/:serverId/user', ticketController.searchTicketsByUser);

module.exports = router;