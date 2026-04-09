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
    const user = await prisma.user.findFirst({
        where: { 
            username: {
                equals: username,
                mode: 'insensitive'
            }
        },
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
    const updatedUser = await prisma.user.update({
        where: { id: userId },
        data
    });
    
    // Recalculate strength after general update
    const strength = await calculateProfileStrength(userId);
    return await prisma.user.update({
        where: { id: userId },
        data: { completionRatio: strength }
    });
};

const calculateProfileStrength = async (userId) => {
    const user = await prisma.user.findUnique({
        where: { id: userId },
        include: {
            experience: true,
            education: true,
            certifications: true,
            projects: true
        }
    });

    if (!user) return 0;

    let score = 0;

    // 1. Basic Info (20%)
    if (user.avatar) score += 5;
    if (user.bio && user.bio.length > 20) score += 10;
    if (user.name) score += 5;

    // 2. Target Strategy (10%)
    if (user.targetRole) score += 5;
    if (user.careerStage) score += 5;

    // 3. Education (20%)
    if (user.education.length > 0) score += 20;

    // 4. Experience (20%)
    if (user.experience.length > 0) score += 20;

    // 5. Projects (20%)
    if (user.projects.length > 0) score += 20;

    // 6. Socials & Certs (10%)
    if (user.githubUrl || user.linkedIn || user.websiteUrl) score += 5;
    if (user.certifications.length > 0) score += 5;

    return Math.min(score, 100);
};

// --- Experience CRUD ---
const addExperience = async (userId, data) => {
    const exp = await prisma.experience.create({
        data: { ...data, userId }
    });
    await updateProfileStrength(userId);
    return exp;
};

const updateExperience = async (userId, id, data) => {
    return await prisma.experience.update({
        where: { id, userId },
        data
    });
};

const deleteExperience = async (userId, id) => {
    const result = await prisma.experience.delete({ where: { id, userId } });
    await updateProfileStrength(userId);
    return result;
};

// --- Education CRUD ---
const addEducation = async (userId, data) => {
    const edu = await prisma.education.create({
        data: { ...data, userId }
    });
    await updateProfileStrength(userId);
    return edu;
};

const updateEducation = async (userId, id, data) => {
    return await prisma.education.update({
        where: { id, userId },
        data
    });
};

const deleteEducation = async (userId, id) => {
    const result = await prisma.education.delete({ where: { id, userId } });
    await updateProfileStrength(userId);
    return result;
};

// --- Certification CRUD ---
const addCertification = async (userId, data) => {
    const cert = await prisma.certification.create({
        data: { ...data, userId }
    });
    await updateProfileStrength(userId);
    return cert;
};

const deleteCertification = async (userId, id) => {
    const result = await prisma.certification.delete({ where: { id, userId } });
    await updateProfileStrength(userId);
    return result;
};

const updateProfileStrength = async (userId) => {
    const strength = await calculateProfileStrength(userId);
    await prisma.user.update({
        where: { id: userId },
        data: { completionRatio: strength }
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
    let finalStatus = status.toUpperCase();
    if (finalStatus === 'VERIFIED') finalStatus = 'APPROVED'; // Normalize to standardized status

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

const checkUsernameAvailability = async (username) => {
    const user = await prisma.user.findUnique({
        where: { username: username.toLowerCase() }
    });
    return { available: !user };
};

module.exports = {
    getProfile,
    getUserProfile,
    updateProfile,
    getPortfolioByUsername,
    completeOnboarding,
    listPendingVerifications,
    verifyUser,
    updatePulse,
    calculateProfileStrength,
    addExperience,
    updateExperience,
    deleteExperience,
    addEducation,
    updateEducation,
    deleteEducation,
    addCertification,
    deleteCertification,
    checkUsernameAvailability
};
