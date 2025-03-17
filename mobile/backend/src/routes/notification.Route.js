const express = require("express");
const router = express.Router();
<<<<<<< HEAD
const notificationController = require("../controllers/notification.controller");
const { authenticateUser } = require("../middleware/middleware");

// Protected routes - require authentication
router.get("/", authenticateUser, notificationController.getAllNotifications);
router.get("/unread", authenticateUser, notificationController.getUnreadCount);
router.patch("/:id", authenticateUser, notificationController.markAsRead);
router.delete(
  "/:id",
  authenticateUser,
  notificationController.deleteNotification
);

// Add logging middleware at the end
router.use((req, res, next) => {
  console.log("📡 Notification route accessed:", {
    method: req.method,
    path: req.path,
    userId: req.user?.id,
=======
const notificationController = require('../controllers/notification.controller');
const { authenticateUser } = require('../middleware/middleware');

// Protected routes - require authentication
router.get('/', authenticateUser, notificationController.getAllNotifications);
router.get('/unread', authenticateUser, notificationController.getUnreadCount);
router.patch('/:id', authenticateUser, notificationController.markAsRead);
router.delete('/:id', authenticateUser, notificationController.deleteNotification);

// Add logging middleware at the end
router.use((req, res, next) => {
  console.log('📡 Notification route accessed:', {
    method: req.method,
    path: req.path,
    userId: req.user?.id
>>>>>>> 85e19f74779628e660bfc98ab7c5858d9371d9c6
  });
  next();
});

<<<<<<< HEAD
module.exports = router;
=======
module.exports = router;
>>>>>>> 85e19f74779628e660bfc98ab7c5858d9371d9c6
