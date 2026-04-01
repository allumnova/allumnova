const prisma = require('../../models');

const listEnvironments = async (collegeId) => {
    return await prisma.environment.findMany({
        where: { collegeId, status: 'VERIFIED' },
        include: { 
            _count: { select: { members: true } },
            members: { take: 5, include: { user: { select: { avatar: true, name: true } } } }
        }
    });
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
                    role: 'ADMIN' // The proposer is the initial admin
                }
            }
        }
    });
};

const joinEnvironment = async (userId, environmentId) => {
    return await prisma.environmentMembership.upsert({
        where: {
            userId_environmentId: { userId, environmentId }
        },
        update: {},
        create: {
            userId,
            environmentId
        }
    });
};

module.exports = {
    listEnvironments,
    proposeEnvironment,
    joinEnvironment
};
