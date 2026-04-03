const prisma = require('../../models');
const emailService = require('../../utils/email.service');

const getProfile = async (userId) => {
    return await prisma.user.findUnique({
        where: { id: userId },
        include: {
            colleges: {
                include: {
                    college: true
                }
            },
            posts: {
                orderBy: { createdAt: 'desc' },
                take: 50,
                include: {
                    author: { 
                        select: { id: true, name: true, avatar: true, reputationScore: true, tierLevel: true, is_verified: true } 
                    },
                    media: true,
                    _count: { select: { likes: true, comments: true } }
                }
            },
            projects: {
                orderBy: { createdAt: 'desc' },
                take: 20
            }
        }
    });
};

const getUserProfile = async (targetUserId, currentUserId) => {
    const user = await prisma.user.findUnique({
        where: { id: targetUserId },
        select: {
            id: true,
            name: true,
            avatar: true,
            bio: true,
            batch_year: true,
            department: true,
            reputationScore: true,
            role: true,
            tierLevel: true,
            is_verified: true,
            createdAt: true,
            colleges: {
                include: {
                    college: {
                        select: { name: true, logo: true }
                    }
                }
            },
            posts: {
                where: { visibility: { in: ['college', 'public'] } },
                orderBy: { createdAt: 'desc' },
                take: 50,
                include: {
                    author: { 
                        select: { 
                            id: true,
                            name: true, 
                            avatar: true,
                            reputationScore: true,
                            tierLevel: true,
                            is_verified: true
                        } 
                    },
                    media: true,
                    _count: { select: { likes: true, comments: true } }
                }
            },
            projects: {
                orderBy: { createdAt: 'desc' },
                take: 20
            }
        }
    });

    if (!user) throw new Error('User not found');

    // Fetch mutual connections & connection status
    let connectionStatus = null;
    let mutualConnections = [];
    let mutualCount = 0;

    if (currentUserId && currentUserId !== targetUserId) {
        // 1. Connection Status
        const connection = await prisma.connection.findFirst({
            where: {
                OR: [
                    { senderId: currentUserId, receiverId: targetUserId },
                    { senderId: targetUserId, receiverId: currentUserId }
                ]
            }
        });
        if (connection) {
            connectionStatus = {
                status: connection.status,
                isSender: connection.senderId === currentUserId,
                id: connection.id
            };
        }

        // 2. Mutual Connections
        const currentConnections = await prisma.connection.findMany({
            where: {
                OR: [
                    { senderId: currentUserId, status: 'accepted' },
                    { receiverId: currentUserId, status: 'accepted' }
                ]
            },
            select: { senderId: true, receiverId: true }
        });
        const currentUserIds = new Set(currentConnections.flatMap(c => [c.senderId, c.receiverId]).filter(id => id !== currentUserId));

        const mutuals = await prisma.connection.findMany({
            where: {
                OR: [
                    { senderId: targetUserId, status: 'accepted', receiverId: { in: Array.from(currentUserIds) } },
                    { receiverId: targetUserId, status: 'accepted', senderId: { in: Array.from(currentUserIds) } }
                ]
            },
            include: {
                sender: { select: { id: true, name: true, avatar: true } },
                receiver: { select: { id: true, name: true, avatar: true } }
            }
        });

        mutualCount = mutuals.length;
        mutualConnections = mutuals.slice(0, 3).map(m => m.senderId === targetUserId ? m.receiver : m.sender);
    }

    return { ...user, connectionStatus, mutualConnections, mutualCount };
};

const getPortfolioByUsername = async (username) => {
    const user = await prisma.user.findUnique({
        where: { username },
        include: {
            experience: {
                orderBy: { startDate: 'desc' }
            },
            education: {
                orderBy: { startDate: 'desc' }
            },
            projects: {
                orderBy: { createdAt: 'desc' },
                include: {
                    milestones: true,
                    _count: { select: { hypes: true } }
                }
            },
            colleges: {
                include: {
                    college: true
                }
            }
        }
    });

    if (!user) throw new Error('Portfolio not found');
    return user;
};

const updateProfile = async (userId, data) => {
    return await prisma.user.update({
        where: { id: userId },
        data
    });
};

const completeOnboarding = async (userId, onboardingData) => {
    const { phone, linkedIn, collegeId, role, batch, documentUrl } = onboardingData;

    return await prisma.$transaction(async (tx) => {
        // 0. Check for existing phone number (excluding this user)
        if (phone) {
            const existingUser = await tx.user.findFirst({
                where: { 
                    phone,
                    id: { not: userId }
                }
            });
            if (existingUser) {
                throw new Error('This phone number is already registered with another account.');
            }
        }

        // 1. Update User Profile
        const user = await tx.user.update({
            where: { id: userId },
            data: {
                phone,
                linkedIn,
                is_verified: false
            }
        });

        // 2. Create College Request (CollegeMembership)
        await tx.collegeMembership.upsert({
            where: {
                userId_collegeId: { userId, collegeId }
            },
            create: {
                userId,
                collegeId,
                role,
                batch,
                documentUrl,
                status: 'PENDING'
            },
            update: {
                role,
                batch,
                documentUrl,
                status: 'PENDING'
            }
        });

        return user;
    });
};

const listPendingVerifications = async () => {
    return await prisma.collegeMembership.findMany({
        where: { status: 'PENDING' },
        include: {
            user: {
                select: { id: true, name: true, email: true, phone: true, linkedIn: true, avatar: true }
            },
            college: {
                select: { name: true }
            }
        }
    });
};

const verifyUser = async (mappingId, status) => {
    const finalStatus = status.toUpperCase();
    const result = await prisma.$transaction(async (tx) => {
        const mapping = await tx.collegeMembership.update({
            where: { id: mappingId },
            data: { status: finalStatus },
            include: { 
                user: true,
                college: true
            }
        });

        if (finalStatus === 'APPROVED') {
            await tx.user.update({
                where: { id: mapping.userId },
                data: { 
                    is_verified: true,
                    verificationLevel: 'VERIFIED'
                }
            });
        }

        return mapping;
    });

    // Send emails outside the transaction to avoid timeouts
    if (finalStatus === 'APPROVED') {
        try {
            await emailService.sendUserApproval(result.user.email, result.college.name);
            await emailService.sendWelcomeEmail(result.user.email, result.user.name);
        } catch (emailError) {
            console.error('VERIFICATION_EMAIL_ERROR:', emailError);
            // We don't fail the verification if email fails, but we log it
        }
    }

    return result;
};

const updatePulse = async (userId, { pulse, pulseEmoji }) => {
    const user = await prisma.user.update({
        where: { id: userId },
        data: {
            pulse,
            pulseEmoji,
            pulseUpdatedAt: new Date()
        },
        include: {
            colleges: {
                where: { status: 'APPROVED' },
                select: { collegeId: true }
            }
        }
    });

    return user;
};

module.exports = {
    getProfile,
    getUserProfile,
    updateProfile,
    completeOnboarding,
    listPendingVerifications,
    verifyUser,
    updatePulse
};
