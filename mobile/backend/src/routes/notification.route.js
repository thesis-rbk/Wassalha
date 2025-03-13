const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notification.controller');
const { authenticateUser } = require('../middleware/middleware');

// Protected routes - require authentication
router.get('/', authenticateUser, notificationController.getAllNotifications);
router.get('/unread', authenticateUser, notificationController.getUnreadCount);
router.patch('/:id', authenticateUser, notificationController.markAsRead);

// Add logging middleware at the end
router.use((req, res, next) => {
  console.log('📡 Notification route accessed:', {
    method: req.method,
    path: req.path,
    userId: req.user?.id
  });
  next();
});

module.exports = router;