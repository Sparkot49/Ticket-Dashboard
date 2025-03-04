const express = require('express');
const router = express.Router();
const serverController = require('../controllers/serverController');
const authMiddleware = require('../middleware/authMiddleware');

// Middleware d'authentification
router.use(authMiddleware);

// Routes
router.get('/', serverController.getUserServers);
router.get('/:id', serverController.getServerById);
router.post('/moderator', serverController.addModerator);
router.delete('/:serverId/moderator/:moderatorId', serverController.removeModerator);
router.post('/category', serverController.addTicketCategory);
router.delete('/:serverId/category/:categoryId', serverController.removeTicketCategory);

module.exports = router;