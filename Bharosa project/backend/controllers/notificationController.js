const Notification = require('../models/Notification');

// @desc    Get all notifications for a student
// @route   GET /api/notifications/:studentId
// @access  Private
const getNotifications = async (req, res, next) => {
  try {
    // Allow fetching by userId directly or via param
    const userId = req.params.studentId || req.user._id;

    if (userId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Access denied.' });
    }

    const notifications = await Notification.find({ userId })
      .sort({ createdAt: -1 })
      .limit(50);

    const unreadCount = notifications.filter((n) => !n.isRead).length;

    res.json({ success: true, unreadCount, total: notifications.length, notifications });
  } catch (err) {
    next(err);
  }
};

// @desc    Mark notification(s) as read
// @route   PUT /api/notifications/read
// @access  Private
const markAsRead = async (req, res, next) => {
  try {
    const { ids, all } = req.body;

    if (all) {
      await Notification.updateMany({ userId: req.user._id }, { isRead: true });
      return res.json({ success: true, message: 'All notifications marked as read.' });
    }

    if (ids && ids.length) {
      await Notification.updateMany(
        { _id: { $in: ids }, userId: req.user._id },
        { isRead: true }
      );
      return res.json({ success: true, message: 'Notifications marked as read.' });
    }

    res.status(400).json({ success: false, message: 'Provide ids array or all:true.' });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete a notification
// @route   DELETE /api/notifications/:id
// @access  Private
const deleteNotification = async (req, res, next) => {
  try {
    await Notification.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    res.json({ success: true, message: 'Notification deleted.' });
  } catch (err) {
    next(err);
  }
};

module.exports = { getNotifications, markAsRead, deleteNotification };
