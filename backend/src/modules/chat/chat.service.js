const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

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

    // Flatten members into users array for frontend compatibility
    return conversations.map(conv => ({
        ...conv,
        users: conv.members.map(m => m.user)
    }));
};

exports.listMessages = async (conversationId, userId) => {
    // Basic auth check: is user in conversation?
    const conversation = await prisma.conversation.findUnique({
        where: { id: conversationId },
        include: { members: { select: { userId: true } } }
    });

    if (!conversation || !conversation.members.some(m => m.userId === userId)) {
        throw new Error('Unauthorized');
    }

    return await prisma.message.findMany({
        where: { conversationId },
        orderBy: { createdAt: 'asc' },
        include: { sender: { select: { id: true, name: true, avatar: true } } }
    });
};

exports.createMessage = async (senderId, conversationId, receiverId, content, mediaUrl = null) => {
    let activeConversationId = conversationId;

    if (!activeConversationId && receiverId) {
        // Find existing or create new conversation
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
