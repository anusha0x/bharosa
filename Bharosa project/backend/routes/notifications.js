const express = require('express');
const router = express.Router();
const { getNotifications, markAsRead, deleteNotification } = require('../controllers/notificationController');
const { protect } = require('../middleware/auth');

router.get('/:studentId', protect, getNotifications);
router.put('/read', protect, markAsRead);
router.delete('/:id', protect, deleteNotification);

module.exports = router;
