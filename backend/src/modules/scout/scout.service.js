const prisma = require('../../models');

const scoutService = {
    /**
     * Analyze user interests and target role to find "Parallel Success Signals"
     */
    findPeerClusters: async (userId, collegeId) => {
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { targetRole: true, interests: true, reputationScore: true }
        });

        if (!user || (!user.targetRole && user.interests.length === 0)) {
            return [];
        }

        // Find peers with same role but slightly higher reputation (1 step ahead)
        return await prisma.user.findMany({
            where: {
                id: { not: userId },
                colleges: { some: { collegeId, status: 'APPROVED' } },
                targetRole: user.targetRole,
                reputationScore: { gte: user.reputationScore },
                role: 'student'
            },
            select: {
                id: true,
                name: true,
                avatar: true,
                reputationScore: true,
                tierLevel: true,
                targetRole: true,
                interests: true
            },
            orderBy: { reputationScore: 'asc' },
            take: 5
        });
    },

    /**
     * Find Alumni who have verified career success in matching departments
     */
    findAlumniBlueprints: async (userId, collegeId) => {
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { department: true, targetRole: true }
        });

        return await prisma.user.findMany({
            where: {
                role: 'alumni',
                department: user?.department,
                colleges: { some: { collegeId, status: 'APPROVED' } },
                OR: [
                    { targetRole: user?.targetRole },
                    { reputationScore: { gte: 5000 } } // Frequency or Source tier
                ]
            },
            include: {
                experience: { take: 1, orderBy: { startDate: 'desc' } },
                certifications: { take: 3 }
            },
            take: 3
        });
    },

    /**
     * Map scattered interests into a "Career Archetype"
     */
    analyzeArchetype: async (userId) => {
        const user = await prisma.user.findUnique({
            where: { id: userId },
            include: { projects: true }
        });

        // Simplified logic for Archetype determination
        const interests = user.interests || [];
        const projectCount = user.projects.length;

        if (interests.some(i => i.toLowerCase().includes('design')) && projectCount > 0) {
            return "The Product Visionary";
        } else if (interests.some(i => i.toLowerCase().includes('ai')) || interests.some(i => i.toLowerCase().includes('data'))) {
            return "The Technical Architect";
        } else if (projectCount > 5) {
            return "The High-Velocity Builder";
        }

        return "The Exploring Pioneer";
    }
};

module.exports = scoutService;
