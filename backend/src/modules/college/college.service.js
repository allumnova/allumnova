const prisma = require('../../models');
const emailService = require('../../utils/email.service');

const getAllColleges = async () => {
    return await prisma.college.findMany();
};

const getCollegeBySubdomain = async (subdomain) => {
    return await prisma.college.findUnique({
        where: { subdomain }
    });
};

const joinCollege = async (userId, collegeId, role = 'student') => {
    // Check if mapping already exists
    const existing = await prisma.collegeMembership.findUnique({
        where: {
            userId_collegeId: { userId, collegeId }
        }
    });

    if (existing) {
        if (existing.status === 'PENDING') {
            throw new Error('You have already requested to join this college. Please wait for approval.');
        }
        if (existing.status === 'VERIFIED') {
            throw new Error('You are already a member of this college.');
        }
    }

    return await prisma.collegeMembership.create({
        data: {
            userId,
            collegeId,
            role,
            status: 'PENDING'
        }
    });
};

    if (finalStatus === 'APPROVED' || finalStatus === 'VERIFIED') {
        const approvedStatus = 'APPROVED';
        const membershipUpdate = await prisma.collegeMembership.update({
            where: { id: mappingId },
            data: { status: approvedStatus },
            include: { user: true, college: true }
        });

        // Elevate user's global verification status
        await prisma.user.update({
            where: { id: membershipUpdate.userId },
            data: { 
                is_verified: true,
                verificationLevel: 'VERIFIED'
            }
        });
        await emailService.sendUserApproval(membershipUpdate.user.email, membershipUpdate.college.name);
        await emailService.sendWelcomeEmail(membershipUpdate.user.email, membershipUpdate.user.name);
        return membershipUpdate;
    }

    return membership;

const getPendingRequests = async (collegeId) => {
    return await prisma.collegeMembership.findMany({
        where: { collegeId, status: 'PENDING' }, // Changed to 'PENDING' for consistency
        include: { user: true }
    });
};

const suggestCollege = async (requesterId, data) => {
    return await prisma.collegeRequest.create({
        data: {
            requesterId,
            name: data.name,
            domain: data.domain || data.subdomain || null,
            subdomain: data.subdomain || null,
            website: data.website,
            logo: data.logo,
            location: data.location,
            description: data.description,
            status: 'PENDING'
        }
    });
};

const getMyCollegeRequests = async (userId) => {
    return await prisma.collegeRequest.findMany({
        where: { requesterId: userId },
        orderBy: { createdAt: 'desc' }
    });
};

const listAllCollegeRequests = async () => {
    return await prisma.collegeRequest.findMany({
        orderBy: { createdAt: 'desc' }
    });
};

const reviewCollegeRequest = async (requestId, status, updates = {}) => {
    const request = await prisma.collegeRequest.findUnique({
        where: { id: requestId },
        include: { requester: true }
    });

    if (!request) throw new Error('Request not found');

    const finalStatus = status.toUpperCase();
    const updatedRequest = await prisma.collegeRequest.update({
        where: { id: requestId },
        data: { status: finalStatus }
    });

    // If approved, create the college with potentially corrected data
    if (finalStatus === 'APPROVED') {
        const name = updates.name || request.name;
        const subdomain = updates.subdomain || request.subdomain || name.toLowerCase().replace(/\s+/g, '-');

        await prisma.college.create({
            data: {
                name,
                domain: updates.domain || subdomain + '.allumnova.com', // PRD: domain
                subdomain,
                logo: request.logo,
            }
        });

        // Send email to request.requester.email notifying them the college is ready
        await emailService.sendCollegeApproval(request.requester.email, name, subdomain);
    }

    return updatedRequest;
};

module.exports = {
    getAllColleges,
    getCollegeBySubdomain,
    joinCollege,
    respondToJoinRequest,
    getPendingRequests,
    suggestCollege,
    getMyCollegeRequests,
    listAllCollegeRequests,
    reviewCollegeRequest
};
