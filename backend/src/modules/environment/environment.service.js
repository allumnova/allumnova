const prisma = require('../../models');

const listEnvironments = async (collegeId, userId) => {
    const hubs = await prisma.environment.findMany({
        where: { collegeId, status: 'VERIFIED' },
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
            status: 'PENDING',
            members: {
                create: {
                    userId,
                    role: 'ADMIN',
                    status: 'APPROVED' // Creator is automatically approved admin
                }
            }
        }
    });
};

const requestToJoin = async (userId, environmentId) => {
    return await prisma.environmentMembership.upsert({
        where: {
            userId_environmentId: { userId, environmentId }
        },
        update: {
            status: 'PENDING'
        },
        create: {
            userId,
            environmentId,
            status: 'PENDING'
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

module.exports = {
    listEnvironments,
    proposeEnvironment,
    requestToJoin,
    manageMembership,
    listPendingMembers
};
