const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authMiddleware = require('../middleware/authMiddleware');

// Middleware d'authentification
router.use(authMiddleware);

// Routes
router.get('/me', userController.getMe);
router.get('/:userId', userController.getUserById);
router.post('/:userId/notes', userController.addUserNote);

module.exports = router;