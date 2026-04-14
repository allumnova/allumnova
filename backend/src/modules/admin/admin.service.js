const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const getDashboardStats = async () => {
    const totalUsers = await prisma.user.count();
    const registeredColleges = await prisma.college.count();
    const pendingVerifications = await prisma.collegeMembership.count({
        where: { status: 'PENDING' }
    });

    const pendingColleges = await prisma.collegeRequest.count({
        where: { status: 'PENDING' }
    });

    const reportedContent = await prisma.report.count();

    // Fetch recent activity loosely
    const recentUsers = await prisma.user.findMany({
        orderBy: { createdAt: 'desc' },
        take: 3,
        select: { id: true, name: true, createdAt: true, is_verified: true }
    });

    const recentCollegeRequests = await prisma.collegeRequest.findMany({
        orderBy: { createdAt: 'desc' },
        take: 3,
        select: { id: true, name: true, createdAt: true, status: true, requesterId: true }
    });

    let recentActivity = [];

    recentUsers.forEach(u => {
        recentActivity.push({
            id: `usr_${u.id}`,
            type: u.is_verified ? 'user_joined' : 'verification',
            user: u.name,
            detail: u.is_verified ? 'Joined the platform' : 'Verification pending approval',
            time: u.createdAt
        });
    });

    recentCollegeRequests.forEach(r => {
        recentActivity.push({
            id: `colreq_${r.id}`,
            type: 'college_request',
            user: r.name,
            detail: `New college request submitted. Status: ${r.status}`,
            time: r.createdAt
        });
    });

    recentActivity.sort((a, b) => new Date(b.time) - new Date(a.time));
    recentActivity = recentActivity.slice(0, 5);

    const formatTimeAgo = (date) => {
        const seconds = Math.floor((new Date() - new Date(date)) / 1000);
        let interval = seconds / 31536000;
        if (interval > 1) return Math.floor(interval) + " years ago";
        interval = seconds / 2592000;
        if (interval > 1) return Math.floor(interval) + " months ago";
        interval = seconds / 86400;
        if (interval > 1) return Math.floor(interval) + " days ago";
        interval = seconds / 3600;
        if (interval > 1) return Math.floor(interval) + " hours ago";
        interval = seconds / 60;
        if (interval > 1) return Math.floor(interval) + " minutes ago";
        return Math.floor(seconds) + " seconds ago";
    };

    return {
        stats: {
            totalUsers,
            registeredColleges,
            pendingVerifications,
            pendingColleges,
            reportedContent
        },
        recentActivity: recentActivity.map(act => ({ ...act, time: formatTimeAgo(act.time) }))
    };
};

const getAllPosts = async (limit = 50, cursor) => {
    const prisma = require('../../models');
    return await prisma.post.findMany({
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
            author: { select: { id: true, name: true, avatar: true, reputationScore: true, tierLevel: true } },
            media: true,
            _count: { select: { likes: true, comments: true } }
        }
    });
};

module.exports = {
    getDashboardStats,
    getAllPosts
};
