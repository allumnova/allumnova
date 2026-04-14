const prisma = require('../../models');

const listEnvironments = async (collegeId, userId) => {
    const hubs = await prisma.environment.findMany({
        where: { 
            collegeId, 
            status: 'VERIFIED',
            // Only show HIDDEN hubs if user is already a member
            NOT: {
                AND: [
                    { privacyLevel: 'HIDDEN' },
                    { NOT: { members: { some: { userId } } } }
                ]
            }
        },
        include: { 
            _count: { select: { members: { where: { status: 'APPROVED' } } } },
            members: {
                where: { userId },
                select: { status: true, role: true }
            }
        }
    });

    return hubs.map(h => ({
        ...h,
        memberCount: h._count.members,
        userStatus: h.members[0]?.status || 'NONE',
        userRole: h.members[0]?.role || null
    }));
};

const proposeEnvironment = async (collegeId, userId, data) => {
    return await prisma.environment.create({
        data: {
            collegeId,
            name: data.name,
            description: data.description,
            type: data.type || 'HUB',
            privacyLevel: data.privacyLevel || 'PUBLIC',
            joinQuestions: data.joinQuestions || [],
            joinCriteria: data.joinCriteria || "",
            status: 'PENDING',
            members: {
                create: {
                    userId,
                    role: 'ADMIN',
                    status: 'APPROVED'
                }
            }
        }
    });
};

const requestToJoin = async (userId, environmentId, answers = {}) => {
    const hub = await prisma.environment.findUnique({ where: { id: environmentId } });
    if (!hub) throw new Error('Hub not found');

    const initialState = hub.privacyLevel === 'PUBLIC' ? 'APPROVED' : 'PENDING';

    return await prisma.environmentMembership.upsert({
        where: {
            userId_environmentId: { userId, environmentId }
        },
        update: {
            status: initialState,
            answers
        },
        create: {
            userId,
            environmentId,
            status: initialState,
            answers
        }
    });
};

const manageMembership = async (membershipId, status, adminId) => {
    const membership = await prisma.environmentMembership.findUnique({
        where: { id: membershipId },
        include: { environment: true }
    });

    if (!membership) throw new Error('Membership not found');

    // Check if adminId has permission (Admin of hub or College Admin)
    const adminMembership = await prisma.environmentMembership.findUnique({
        where: { userId_environmentId: { userId: adminId, environmentId: membership.environmentId } }
    });

    const user = await prisma.user.findUnique({ where: { id: adminId }, select: { role: true } });

    if (adminMembership?.role !== 'ADMIN' && user?.role !== 'admin') {
        throw new Error('Unauthorized to manage hub membership');
    }

    return await prisma.environmentMembership.update({
        where: { id: membershipId },
        data: { status }
    });
};

const listPendingMembers = async (environmentId, adminId) => {
    const adminMembership = await prisma.environmentMembership.findUnique({
        where: { userId_environmentId: { userId: adminId, environmentId } }
    });

    if (adminMembership?.role !== 'ADMIN') {
        throw new Error('Unauthorized');
    }

    return await prisma.environmentMembership.findMany({
        where: { environmentId, status: 'PENDING' },
        include: { user: { select: { id: true, name: true, avatar: true } } }
    });
};

const listAllGlobalPendingProposals = async () => {
    return await prisma.environment.findMany({
        where: { status: 'PENDING' },
        include: { 
            college: { select: { name: true } },
            members: {
                where: { role: 'ADMIN' },
                include: { user: { select: { name: true, email: true } } }
            }
        },
        orderBy: { createdAt: 'desc' }
    });
};

const reviewGlobalProposal = async (environmentId, status) => {
    const finalStatus = status.toUpperCase() === 'APPROVED' ? 'VERIFIED' : 'REJECTED';
    return await prisma.environment.update({
        where: { id: environmentId },
        data: { status: finalStatus }
    });
};

module.exports = {
    listEnvironments,
    proposeEnvironment,
    requestToJoin,
    manageMembership,
    listPendingMembers,
    listAllGlobalPendingProposals,
    reviewGlobalProposal
};
