const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const getDashboardStats = async () => {
    const totalUsers = await prisma.user.count();
    const registeredColleges = await prisma.college.count();
    const pendingVerifications = await prisma.collegeMembership.count({
        where: { status: 'PENDING' }
    });

    const reportedContent = await prisma.report.count();

    // Fetch recent activity loosely
    // Get newest users
    const recentUsers = await prisma.user.findMany({
        orderBy: { createdAt: 'desc' },
        take: 3,
        select: { id: true, name: true, createdAt: true, is_verified: true }
    });

    // Get newest college requests
    const recentCollegeRequests = await prisma.collegeRequest.findMany({
        orderBy: { createdAt: 'desc' },
        take: 3,
        select: { id: true, name: true, createdAt: true, status: true, requesterId: true }
    });

    // Combine and format activity
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
            user: r.name, // Using college name as the actor for simplicity in dashboard
            detail: `New college request submitted. Status: ${r.status}`,
            time: r.createdAt
        });
    });

    // Sort combined activity by time desc and take top 5
    recentActivity.sort((a, b) => new Date(b.time) - new Date(a.time));
    recentActivity = recentActivity.slice(0, 5);

    // Format dates to relative strings for the frontend
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

    recentActivity = recentActivity.map(act => ({
        ...act,
        time: formatTimeAgo(act.time)
    }));

    return {
        stats: {
            totalUsers,
            registeredColleges,
            pendingVerifications,
            reportedContent
        },
        recentActivity
    };
};

module.exports = {
    getDashboardStats
};
