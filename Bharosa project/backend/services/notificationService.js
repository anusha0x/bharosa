const Notification = require('../models/Notification');

const createNotification = async ({ userId, title, message, type, relatedApplication, relatedScheme }) => {
  try {
    const notification = await Notification.create({
      userId,
      title,
      message,
      type: type || 'info',
      relatedApplication,
      relatedScheme,
    });
    return notification;
  } catch (err) {
    console.error('Notification creation error:', err.message);
  }
};

const notifyStatusChange = async (userId, applicationId, newStatus, schemeName) => {
  const messages = {
    'Under Verification': {
      title: '📋 Application Under Verification',
      message: `Your application for "${schemeName}" is now under verification.`,
    },
    'Document Review': {
      title: '📄 Documents Under Review',
      message: `Documents for "${schemeName}" are being reviewed.`,
    },
    Approved: {
      title: '🎉 Application Approved!',
      message: `Congratulations! Your application for "${schemeName}" has been approved.`,
    },
    Rejected: {
      title: '❌ Application Rejected',
      message: `Unfortunately, your application for "${schemeName}" was rejected. Contact support for details.`,
    },
  };

  const notif = messages[newStatus];
  if (notif) {
    await createNotification({
      userId,
      title: notif.title,
      message: notif.message,
      type: newStatus === 'Approved' ? 'approval' : newStatus === 'Rejected' ? 'rejection' : 'status_update',
      relatedApplication: applicationId,
    });
  }
};

module.exports = { createNotification, notifyStatusChange };
