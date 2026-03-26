const prisma = require('../../models');

const getRoadmaps = async (collegeId, category) => {
    const where = { collegeId };
    if (category) where.category = category;

    return await prisma.roadmap.findMany({
        where,
        include: {
            _count: { select: { steps: true } },
            author: { select: { id: true, name: true, avatar: true } }
        },
        orderBy: { createdAt: 'desc' }
    });
};

const getRoadmapDetails = async (roadmapId, userId) => {
    const roadmap = await prisma.roadmap.findUnique({
        where: { id: roadmapId },
        include: {
            steps: { orderBy: { order: 'asc' } },
            author: { select: { id: true, name: true, avatar: true } }
        }
    });

    if (!roadmap) throw new Error('Roadmap not found');

    // Get user progress for these steps
    const progress = await prisma.roadmapProgress.findMany({
        where: {
            userId,
            stepId: { in: roadmap.steps.map(s => s.id) }
        }
    });

    const completedStepIds = new Set(progress.map(p => p.stepId));

    return {
        ...roadmap,
        steps: roadmap.steps.map(step => ({
            ...step,
            isCompleted: completedStepIds.has(step.id)
        }))
    };
};

const markStepComplete = async (userId, stepId) => {
    return await prisma.roadmapProgress.upsert({
        where: {
            userId_stepId: { userId, stepId }
        },
        update: {},
        create: {
            userId,
            stepId
        }
    });
};

const createRoadmap = async (data) => {
    const { title, description, category, authorId, collegeId, steps } = data;

    return await prisma.roadmap.create({
        data: {
            title,
            description,
            category,
            authorId,
            collegeId,
            steps: {
                create: steps.map((step, index) => ({
                    title: step.title,
                    order: step.order || index + 1,
                    video_url: step.video_url,
                    content: step.content,
                    assignment_details: step.assignment_details
                }))
            }
        },
        include: { steps: true }
    });
};

module.exports = {
    getRoadmaps,
    getRoadmapDetails,
    markStepComplete,
    createRoadmap
};
