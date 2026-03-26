const prisma = require('../../models');
const notificationService = require('../notification/notification.service');
const socketUtil = require('../../utils/socket');

exports.discoverUsers = async (userId, collegeId, cursor, limit = 20) => {
    const where = {
        id: { not: userId },
        colleges: {
            some: { collegeId: collegeId }
        },
        sentRequests: {
            none: { receiverId: userId }
        },
        receivedRequests: {
            none: { senderId: userId }
        }
    };

    return await prisma.user.findMany({
        where,
        select: {
            id: true,
            name: true,
            avatar: true,
            reputationScore: true,
            pulse: true,
            pulseEmoji: true,
            colleges: {
                where: { collegeId: collegeId },
                select: { role: true, batch: true }
            }
        },
        take: limit,
        skip: cursor ? 1 : 0,
        cursor: cursor ? { id: cursor } : undefined,
        orderBy: { id: 'asc' }
    });
};

exports.sendConnectionRequest = async (senderId, receiverId) => {
    // 1. Check for existing request or connection
    const existing = await prisma.connection.findFirst({
        where: {
            OR: [
                { senderId, receiverId },
                { senderId: receiverId, receiverId: senderId }
            ]
        }
    });

    if (existing) {
        if (existing.status === 'pending') {
            throw new Error('A connection request is already pending between you and this user.');
        }
        if (existing.status === 'accepted') {
            throw new Error('You are already connected with this user.');
        }
    }

    // 2. Create the connection record
    const connection = await prisma.connection.create({
        data: {
            senderId,
            receiverId,
            status: 'pending'
        },
        include: {
            sender: { select: { id: true, name: true } }
        }
    });

    // PRD PRD Section 9: Actions update reputation
    await prisma.user.update({
        where: { id: senderId },
        data: { reputationScore: { increment: 1 } }
    });

    // Trigger Notification for the receiver
    await notificationService.createNotification(receiverId, 'connect_request', {
        reference_id: connection.id,
        senderName: connection.sender.name,
        message: `${connection.sender.name} sent you a connection request`
    });

    return connection;
};

exports.acceptConnectionRequest = async (requestId, userId) => {
    const request = await prisma.connection.findUnique({
        where: { id: requestId },
        include: { sender: { select: { id: true, name: true } } }
    });

    if (!request || request.receiverId !== userId) {
        throw new Error('Unauthorized or request not found');
    }

    const updated = await prisma.connection.update({
        where: { id: requestId },
        data: { status: 'accepted' },
        include: { receiver: { select: { name: true } } }
    });

    // PRD Section 9: Impact reputation for both
    await prisma.user.updateMany({
        where: { id: { in: [request.senderId, userId] } },
        data: { reputationScore: { increment: 5 } }
    });

    // Mark the corresponding notification as read
    await prisma.notification.updateMany({
        where: {
            userId: userId,
            reference_id: requestId,
            type: 'connect_request'
        },
        data: { is_read: true }
    });

    // Trigger Notification for the sender (the one who initiated the request)
    await notificationService.createNotification(request.senderId, 'connect_accept', {
        reference_id: updated.id,
        receiverName: updated.receiver.name,
        message: `${updated.receiver.name} accepted your connection request`
    });

    return updated;
};

exports.declineConnectionRequest = async (requestId, userId) => {
    const request = await prisma.connection.findUnique({
        where: { id: requestId }
    });

    if (!request || request.receiverId !== userId) {
        throw new Error('Unauthorized or request not found');
    }

    // Delete or mark as declined. We'll delete it to keep discoverability clean.
    await prisma.connection.delete({
        where: { id: requestId }
    });

    // Mark the corresponding notification as read (or delete it)
    await prisma.notification.updateMany({
        where: {
            userId: userId,
            reference_id: requestId,
            type: 'connect_request'
        },
        data: { is_read: true }
    });

    return { success: true, message: 'Request declined' };
};

exports.listConnections = async (userId) => {
    const accepted = await prisma.connection.findMany({
        where: {
            OR: [
                { senderId: userId, status: 'accepted' },
                { receiverId: userId, status: 'accepted' }
            ]
        },
        include: {
            sender: { select: { id: true, name: true, avatar: true } },
            receiver: { select: { id: true, name: true, avatar: true } }
        }
    });

    return accepted.map(conn => conn.senderId === userId ? conn.receiver : conn.sender);
};

exports.getNotifications = async (userId) => {
    const pendingRequests = await prisma.connection.findMany({
        where: {
            receiverId: userId,
            status: 'pending'
        },
        include: {
            sender: { select: { id: true, name: true, avatar: true } }
        },
        orderBy: { createdAt: 'desc' },
        take: 20
    });

    return pendingRequests.map(req => ({
        id: req.id,
        type: 'connect',
        user: {
            name: req.sender?.name || 'Unknown User',
            avatar: req.sender?.avatar || null
        },
        content: `${req.sender?.name || 'Someone'} wants to connect with you`,
        time: new Date(req.createdAt).toLocaleDateString(),
        isImportant: true
    }));
};

exports.listPendingRequests = async (userId) => {
    const incoming = await prisma.connection.findMany({
        where: { receiverId: userId, status: 'pending' },
        include: { sender: { select: { id: true, name: true, avatar: true, department: true, batch_year: true } } }
    });

    const outgoing = await prisma.connection.findMany({
        where: { senderId: userId, status: 'pending' },
        include: { receiver: { select: { id: true, name: true, avatar: true, department: true, batch_year: true } } }
    });

    return {
        incoming: incoming.map(req => ({
            id: req.id,
            user: req.sender,
            createdAt: req.createdAt
        })),
        outgoing: outgoing.map(req => ({
            id: req.id,
            user: req.receiver,
            createdAt: req.createdAt
        }))
    };
};
