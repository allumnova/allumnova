const prisma = require('../../models');
const socketUtil = require('../../utils/socket');

/**
 * Creates a notification, stores it in the database, and pushes it via Socket.io.
 * @param {string} userId - Target user ID
 * @param {string} type - Notification type
 * @param {object} payload - Notification data (targetId, message, etc.)
 */
const createNotification = async (userId, type, payload) => {
    const { message, reference_id, actorId } = payload;

    // 1. Store in DB
    const notification = await prisma.notification.create({
        data: {
            userId,
            actorId: actorId || null,
            type,
            message,
            reference_id: reference_id || null,
            is_read: false
        }
    });

    // 2. Push via Socket (Real-time)
    socketUtil.sendToUser(userId, 'notification', notification);

    return notification;
};

const getUserNotifications = async (userId) => {
    return await prisma.notification.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: 50
    });
};

const markAsRead = async (notificationId, userId) => {
    return await prisma.notification.updateMany({
        where: {
            id: notificationId,
            userId: userId
        },
        data: { is_read: true }
    });
};

const markAllAsRead = async (userId) => {
    return await prisma.notification.updateMany({
        where: { userId },
        data: { is_read: true }
    });
};

module.exports = {
    createNotification,
    getUserNotifications,
    markAsRead,
    markAllAsRead
};
