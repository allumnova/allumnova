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
                where: { visibility: 'college' },
                orderBy: { createdAt: 'desc' },
                take: 10,
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
                    _count: { select: { likes: true, comments: true } }
                }
            }
        }
    });

    if (!user) throw new Error('User not found');

    // Fetch connection status
    let connectionStatus = null;
    if (currentUserId && currentUserId !== targetUserId) {
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
    }

    return { ...user, connectionStatus };
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

        if (finalStatus === 'VERIFIED') {
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
    if (finalStatus === 'VERIFIED') {
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
                where: { status: 'VERIFIED' },
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
