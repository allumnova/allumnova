const admin = require('firebase-admin');
const prisma = require('../../models');
const socketUtil = require('../../utils/socket');

// Initialize Firebase Admin (Assuming credentials via Environment Variables or Config)
if (!admin.apps.length) {
    try {
        admin.initializeApp({
            credential: admin.credential.applicationDefault(),
        });
    } catch (e) {
        console.warn('Firebase Admin failed to initialize. Push notifications will be disabled.', e.message);
    }
}

/**
 * Creates a notification, stores it in the database, and pushes it via Socket.io/FCM.
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

    // 2. Fetch user's FCM tokens for push delivery
    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { fcmTokens: true }
    });

    // 3. Push via Socket (In-app real-time)
    socketUtil.sendToUser(userId, 'notification', notification);

    // 4. Push via FCM (Native Push)
    if (user?.fcmTokens?.length > 0 && admin.apps.length > 0) {
        const pushPayload = {
            notification: {
                title: type.toUpperCase(),
                body: message,
            },
            data: {
                type,
                reference_id: reference_id || '',
            },
            tokens: user.fcmTokens,
        };

        try {
            await admin.messaging().sendEachForMulticast(pushPayload);
        } catch (error) {
            console.error('FCM Multicast delivery failure:', error);
        }
    }

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
