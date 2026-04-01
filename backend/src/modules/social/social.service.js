const prisma = require('../../models');
const notificationService = require('../notification/notification.service');
const socketUtil = require('../../utils/socket');

exports.getRecommendedPeers = async (userId, collegeId) => {
    // 1. Get current user's department and batch
    const user = await prisma.user.findUnique({
        where: { id: userId },
        include: { colleges: { where: { collegeId } } }
    });

    const userCollege = user.colleges[0];

    // 2. Suggest users from same college
    // Priority: Same Department, High Reputation
    return await prisma.user.findMany({
        where: {
            id: { not: userId },
            colleges: {
                some: { 
                    collegeId: collegeId,
                    status: 'VERIFIED'
                }
            },
            sentRequests: { none: { receiverId: userId } },
            receivedRequests: { none: { senderId: userId } }
        },
        select: {
            id: true,
            name: true,
            avatar: true,
            reputationScore: true,
            department: true,
            pulse: true,
            pulseEmoji: true,
            colleges: {
                where: { collegeId: collegeId },
                select: { role: true, batch: true }
            }
        },
        orderBy: [
            { department: user.department ? 'desc' : 'asc' }, // Simple way to match department
            { reputationScore: 'desc' }
        ],
        take: 10
    });
};

exports.listAlumni = async (collegeId, userId, cursor, limit = 20, search) => {
    const where = {
        id: { not: userId },
        colleges: {
            some: { 
                collegeId: collegeId,
                role: 'ALUMNI'
            }
        },
        ...(search && {
            OR: [
                { name: { contains: search, mode: 'insensitive' } },
                { department: { contains: search, mode: 'insensitive' } }
            ]
        })
    };

    return await prisma.user.findMany({
        where,
        select: {
            id: true,
            name: true,
            avatar: true,
            reputationScore: true,
            department: true,
            batch_year: true,
            colleges: {
                where: { collegeId: collegeId },
                select: { role: true, batch: true }
            }
        },
        take: limit,
        skip: cursor ? 1 : 0,
        cursor: cursor ? { id: cursor } : undefined,
        orderBy: { reputationScore: 'desc' }
    });
};

exports.discoverUsers = async (userId, collegeId, cursor, limit = 20, search, role, batchYear) => {
    const where = {
        id: { not: userId },
        colleges: {
            some: { 
                collegeId: collegeId,
                ...(role && { role }),
                ...(batchYear && { batch: parseInt(batchYear) })
            }
        },
        ...(search && {
            OR: [
                { name: { contains: search, mode: 'insensitive' } },
                { department: { contains: search, mode: 'insensitive' } }
            ]
        })
    };

    return await prisma.user.findMany({
        where,
        select: {
            id: true,
            name: true,
            avatar: true,
            reputationScore: true,
            department: true,
            batch_year: true,
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
        orderBy: { id: 'desc' }
    });
};

exports.sendConnectionRequest = async (senderId, receiverId) => {
    const existing = await prisma.connection.findFirst({
        where: {
            OR: [
                { senderId, receiverId },
                { senderId: receiverId, receiverId: senderId }
            ]
        }
    });

    if (existing) {
        if (existing.status === 'pending') throw new Error('Request already pending');
        if (existing.status === 'accepted') throw new Error('Already connected');
    }

    const connection = await prisma.connection.create({
        data: { senderId, receiverId, status: 'pending' },
        include: { sender: { select: { id: true, name: true } } }
    });

    await prisma.user.update({ where: { id: senderId }, data: { reputationScore: { increment: 1 } } });

    await notificationService.createNotification(receiverId, 'connect_request', {
        reference_id: connection.id,
        actorId: senderId,
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

    if (!request || request.receiverId !== userId) throw new Error('Unauthorized');

    const updated = await prisma.connection.update({
        where: { id: requestId },
        data: { status: 'accepted' },
        include: { receiver: { select: { name: true } } }
    });

    await prisma.user.updateMany({
        where: { id: { in: [request.senderId, userId] } },
        data: { reputationScore: { increment: 5 } }
    });

    await prisma.notification.updateMany({
        where: { userId, reference_id: requestId, type: 'connect_request' },
        data: { is_read: true }
    });

    await notificationService.createNotification(request.senderId, 'connect_accept', {
        reference_id: updated.id,
        actorId: userId,
        receiverName: updated.receiver.name,
        message: `${updated.receiver.name} accepted your connection request`
    });

    return updated;
};

exports.declineConnectionRequest = async (requestId, userId) => {
    const request = await prisma.connection.findUnique({ where: { id: requestId } });
    if (!request || request.receiverId !== userId) throw new Error('Unauthorized');

    await prisma.connection.delete({ where: { id: requestId } });
    await prisma.notification.updateMany({
        where: { userId, reference_id: requestId, type: 'connect_request' },
        data: { is_read: true }
    });

    return { success: true };
};

exports.listConnections = async (userId) => {
    const accepted = await prisma.connection.findMany({
        where: { OR: [ { senderId: userId, status: 'accepted' }, { receiverId: userId, status: 'accepted' } ] },
        include: {
            sender: { select: { id: true, name: true, avatar: true } },
            receiver: { select: { id: true, name: true, avatar: true } }
        }
    });

    return accepted.map(conn => {
        const user = conn.senderId === userId ? conn.receiver : conn.sender;
        return { id: conn.id, userId: user.id, name: user.name, avatar: user.avatar };
    });
};

exports.removeConnection = async (userId, targetId) => {
    return await prisma.connection.deleteMany({
        where: { OR: [ { senderId: userId, receiverId: targetId, status: 'accepted' }, { senderId: targetId, receiverId: userId, status: 'accepted' } ] }
    });
};

exports.getNotifications = async (userId) => {
    const notifications = await prisma.notification.findMany({
        where: { userId },
        include: { actor: { select: { id: true, name: true, avatar: true } } },
        orderBy: { createdAt: 'desc' },
        take: 20
    });

    return notifications.map(notif => ({
        id: notif.reference_id || notif.id,
        type: notif.type === 'connect_request' ? 'connect' : notif.type,
        user: notif.actor || { name: 'System', avatar: null },
        content: notif.message,
        time: new Date(notif.createdAt).toLocaleDateString(),
        isImportant: !notif.is_read
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
        incoming: incoming.map(r => ({ id: r.id, user: r.sender, createdAt: r.createdAt })),
        outgoing: outgoing.map(r => ({ id: r.id, user: r.receiver, createdAt: r.createdAt }))
    };
};
