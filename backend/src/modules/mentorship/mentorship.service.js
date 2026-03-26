const prisma = require('../../models');
const notificationService = require('../notification/notification.service');

exports.requestMentorship = async (studentId, alumniId, message) => {
    // Verify alumni role
    const alumni = await prisma.user.findUnique({ where: { id: alumniId } });
    if (!alumni || alumni.role !== 'alumni') {
        throw new Error('Target user is not an alumni or does not exist');
    }

    const request = await prisma.mentorshipRequest.create({
        data: {
            studentId,
            alumniId,
            message,
            status: 'pending'
        },
        include: {
            student: { select: { name: true } }
        }
    });

    await notificationService.createNotification(alumniId, 'mentorship_request', {
        reference_id: request.id,
        senderName: request.student.name,
        message: `${request.student.name} requested mentorship from you.`
    });

    return request;
};

exports.getMentorshipRequests = async (userId, role) => {
    if (role === 'alumni') {
        return await prisma.mentorshipRequest.findMany({
            where: { alumniId: userId },
            include: { student: { select: { id: true, name: true, avatar: true, department: true } } },
            orderBy: { createdAt: 'desc' }
        });
    } else {
        return await prisma.mentorshipRequest.findMany({
            where: { studentId: userId },
            include: { alumni: { select: { id: true, name: true, avatar: true, department: true } } },
            orderBy: { createdAt: 'desc' }
        });
    }
};

exports.updateMentorshipStatus = async (requestId, userId, status) => {
    const request = await prisma.mentorshipRequest.findUnique({
        where: { id: requestId }
    });

    if (!request || request.alumniId !== userId) {
        throw new Error('Unauthorized or request not found');
    }

    const updated = await prisma.mentorshipRequest.update({
        where: { id: requestId },
        data: { status },
        include: { alumni: { select: { name: true } } }
    });

    if (status === 'accepted') {
        // Increment reputation for the alumni
        const reputationService = require('../reputation/reputation.service');
        await reputationService.updateReputation(userId, 50); // 50 points for accepting mentorship
    }

    await notificationService.createNotification(request.studentId, 'mentorship_status', {
        reference_id: updated.id,
        status: status,
        message: `Your mentorship request has been ${status} by ${updated.alumni.name}.`
    });

    return updated;
};
