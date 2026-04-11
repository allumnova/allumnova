const prisma = require('../../models');

exports.listConversations = async (userId) => {
    const conversations = await prisma.conversation.findMany({
        where: {
            members: { some: { userId } }
        },
        include: {
            members: {
                where: { userId: { not: userId } },
                include: {
                    user: { select: { id: true, name: true, avatar: true } }
                }
            },
            messages: {
                orderBy: { createdAt: 'desc' },
                take: 1,
                select: { content: true, createdAt: true }
            }
        },
        orderBy: { updatedAt: 'desc' }
    });

    return conversations.map(conv => ({
        ...conv,
        users: conv.members.map(m => m.user)
    }));
};

exports.listMessages = async (conversationId, userId) => {
    if (!conversationId || conversationId === 'null') return [];

    const conversation = await prisma.conversation.findUnique({
        where: { id: conversationId },
        include: { members: { select: { userId: true } } }
    });

    if (!conversation || !conversation.members.some(m => m.userId === userId)) {
        throw new Error('Unauthorized or conversation not found');
    }

    return await prisma.message.findMany({
        where: { conversationId },
        orderBy: { createdAt: 'asc' },
        include: { sender: { select: { id: true, name: true, avatar: true } } }
    });
};

exports.createMessage = async (senderId, conversationId, receiverId, content, mediaUrl = null) => {
    let activeConversationId = (conversationId && conversationId !== 'null' && conversationId !== '') ? conversationId : null;

    // If no active conversation, find existing 1-on-1 or create new
    if (!activeConversationId && receiverId) {
        const existing = await prisma.conversation.findFirst({
            where: {
                AND: [
                    { members: { some: { userId: senderId } } },
                    { members: { some: { userId: receiverId } } }
                ]
            }
        });

        if (existing) {
            activeConversationId = existing.id;
        } else {
            const created = await prisma.conversation.create({
                data: {
                    members: {
                        create: [
                            { userId: senderId },
                            { userId: receiverId }
                        ]
                    }
                }
            });
            activeConversationId = created.id;
        }
    }

    if (!activeConversationId) {
        throw new Error('Invalid conversation parameters: Need valid conversationId or receiverId');
    }

    const message = await prisma.message.create({
        data: {
            content,
            media_url: mediaUrl,
            senderId,
            conversationId: activeConversationId
        },
        include: { sender: { select: { id: true, name: true, avatar: true } } }
    });

    // Update conversation timestamp
    await prisma.conversation.update({
        where: { id: activeConversationId },
        data: { updatedAt: new Date() }
    });

    return message;
};
