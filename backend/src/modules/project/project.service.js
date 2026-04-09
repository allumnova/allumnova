const prisma = new PrismaClient();
const feedService = require('../feed/feed.service');

const projectService = {
    createProject: async (userId, collegeId, projectData) => {
        const { title, description, repoUrl, demoUrl, lookingFor, milestones, shareToFeed } = projectData;
        
        const project = await prisma.project.create({
            data: {
                title,
                description,
                repoUrl,
                demoUrl,
                lookingFor,
                ownerId: userId,
                collegeId: collegeId,
                status: 'IDEA',
                milestones: {
                    create: milestones?.map(m => ({ title: m })) || []
                }
            },
            include: {
                milestones: true,
                owner: {
                    select: {
                        name: true,
                        avatar: true,
                        reputationScore: true
                    }
                }
            }
        });

        // 🚀 Automated Social Signal: Share to Feed if requested
        if (shareToFeed) {
            try {
                await feedService.createPost(userId, collegeId, {
                    post_type: 'showcase',
                    content: `Just launched a new initiative: **${title}**! 🚀\n\n${description.slice(0, 150)}...`,
                    visibility: 'college',
                    metadata: {
                        projectId: project.id,
                        isAutomated: true
                    }
                });
            } catch (err) {
                console.error('[SOCIAL_LOOP_ERROR] Failed to auto-share project:', err);
            }
        }

        return project;
    },

    getCollegeProjects: async (collegeId, userId = null, searchTerm = null) => {
        const where = { collegeId };
        
        if (searchTerm) {
            where.OR = [
                { title: { contains: searchTerm, mode: 'insensitive' } },
                { description: { contains: searchTerm, mode: 'insensitive' } },
                { lookingFor: { contains: searchTerm, mode: 'insensitive' } }
            ];
        }

        const projects = await prisma.project.findMany({
            where,
            include: {
                owner: {
                    select: {
                        id: true,
                        name: true,
                        avatar: true,
                        reputationScore: true
                    }
                },
                milestones: {
                    orderBy: { createdAt: 'asc' }
                },
                hypes: true,
                _count: {
                    select: { hypes: true }
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        return projects.map(project => {
            const hypeScore = project.hypes.reduce((acc, h) => acc + (h.weight || 1), 0);
            const hasHyped = userId ? project.hypes.some(h => h.userId === userId) : false;
            return {
                ...project,
                hypeScore,
                hasHyped
            };
        });
    },

    updateProject: async (projectId, userId, updates) => {
        const project = await prisma.project.findUnique({ where: { id: projectId } });
        if (!project) throw new Error('Project not found');
        if (project.ownerId !== userId) throw new Error('Unauthorized to edit this project');

        const { milestones, ...projectData } = updates;

        // Handle milestones update if provided
        if (milestones) {
            await prisma.projectMilestone.deleteMany({ where: { projectId } });
            await prisma.projectMilestone.createMany({
                data: milestones.map(m => ({ 
                    projectId, 
                    title: m.title, 
                    isCompleted: m.isCompleted || false 
                }))
            });
        }

        return await prisma.project.update({
            where: { id: projectId },
            data: projectData,
            include: { milestones: true }
        });
    },

    deleteProject: async (projectId, userId) => {
        const project = await prisma.project.findUnique({ where: { id: projectId } });
        if (!project) throw new Error('Project not found');
        if (project.ownerId !== userId) throw new Error('Unauthorized to delete this project');

        await prisma.project.delete({ where: { id: projectId } });
        return { success: true };
    },

    addHype: async (projectId, userId) => {
        // Get user reputation to determine weight
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { reputationScore: true }
        });

        // Hype Gravity: Weight increases with reputation tiers
        let weight = 1; // Default Echo
        const score = user.reputationScore || 0;
        
        if (score >= 10000) weight = 25;      // The Source
        else if (score >= 5000) weight = 10;   // Frequency
        else if (score >= 2500) weight = 5;    // Resonance
        else if (score >= 500) weight = 2;     // Pulse

        const hypeResult = await prisma.projectHype.upsert({
            where: {
                projectId_userId: { projectId, userId }
            },
            update: { weight },
            create: {
                projectId,
                userId,
                weight
            }
        });

        // Reward the project owner
        const project = await prisma.project.findUnique({
            where: { id: projectId },
            select: { ownerId: true }
        });

        if (project) {
            await prisma.user.update({
                where: { id: project.ownerId },
                data: {
                    reputationScore: { increment: weight * 10 } // 10 points per weighted hype
                }
            });
        }

        return hypeResult;
    },

    updateMilestone: async (milestoneId, isCompleted) => {
        return await prisma.projectMilestone.update({
            where: { id: milestoneId },
            data: { isCompleted }
        });
    }
};

module.exports = projectService;
