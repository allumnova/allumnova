const prisma = require('../../models');

const listEnvironments = async (collegeId) => {
    return await prisma.environment.findMany({
        where: { collegeId },
        include: { 
            _count: { select: { members: true } },
            members: { take: 5, include: { user: { select: { avatar: true, name: true } } } }
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
    joinEnvironment
};
