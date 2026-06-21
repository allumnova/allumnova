const prisma = require('../../models');

const generateSlug = (name) => {
    return name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '');
};

const listEnvironments = async (filters, userId) => {
    const whereClause = {
        status: 'VERIFIED',
        NOT: {
            AND: [
                { privacyLevel: 'HIDDEN' },
                { NOT: { members: { some: { userId } } } }
            ]
        }
    };

    if (filters.collegeId) {
        whereClause.collegeId = filters.collegeId;
    }
    if (filters.category) {
        whereClause.category = filters.category;
    }

    const hubs = await prisma.environment.findMany({
        where: whereClause,
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

const CONFIG_MAP = {
    COLLEGE: {
        type: 'college',
        enabledModules: ['feed', 'members', 'connections', 'circles', 'events', 'chat', 'announcements'],
        memberFilters: ['branch', 'batch', 'seniority', 'club', 'open_to_connect'],
        postTypes: ['text', 'image', 'question', 'announcement', 'event', 'lost_found'],
        homeWidgets: ['campus_feed', 'batch_circles', 'student_clubs', 'upcoming_events', 'suggested_seniors']
    },
    CITY: {
        type: 'city',
        enabledModules: ['feed', 'members', 'connections', 'circles', 'events', 'chat', 'announcements'],
        memberFilters: ['new_in_city', 'nearby_area', 'same_interest', 'attending_event', 'available_this_weekend'],
        postTypes: ['text', 'image', 'question', 'announcement', 'event', 'local_recommendation', 'help_request'],
        homeWidgets: ['local_feed', 'nearby_people', 'upcoming_meetups', 'local_circles', 'recommendations', 'new_in_city', 'community_notices']
    },
    PROFESSION: {
        type: 'profession',
        enabledModules: ['feed', 'members', 'connections', 'circles', 'events', 'chat', 'announcements'],
        memberFilters: ['role', 'experience_level', 'skill', 'tool', 'industry', 'city', 'open_to_connect'],
        postTypes: ['text', 'image', 'question', 'announcement', 'event', 'introduction', 'collaboration', 'industry_news'],
        homeWidgets: ['industry_feed', 'people_directory', 'specialization_circles', 'industry_events', 'discussions', 'opportunities', 'organization_pages']
    },
    INTEREST: {
        type: 'interest',
        enabledModules: ['feed', 'members', 'connections', 'circles', 'events', 'chat'],
        memberFilters: ['skill_level', 'nearby', 'looking_for_partner', 'availability', 'same_interest_category'],
        postTypes: ['text', 'image', 'video', 'question', 'event', 'poll', 'challenge'],
        homeWidgets: ['community_feed', 'activity_feed', 'members', 'local_meetups', 'interest_circles', 'challenges', 'media_gallery']
    },
    CAREER: {
        type: 'career',
        enabledModules: ['feed', 'members', 'connections', 'circles', 'events', 'chat', 'announcements'],
        memberFilters: ['learning_goal', 'topic', 'exam_year', 'level', 'schedule', 'looking_for_partner'],
        postTypes: ['text', 'image', 'question', 'event', 'progress_post', 'q_a'],
        homeWidgets: ['learning_feed', 'study_circles', 'discussion_rooms', 'peer_directory', 'sessions_events', 'resources', 'leaderboard']
    },
    LIFESTYLE: {
        type: 'lifestyle',
        enabledModules: ['feed', 'members', 'connections', 'circles', 'events', 'chat'],
        memberFilters: ['nearby', 'activity', 'availability', 'looking_for_buddy', 'attending_event'],
        postTypes: ['text', 'image', 'event', 'plan', 'recommendation', 'poll'],
        homeWidgets: ['lifestyle_feed', 'activity_plans', 'people_nearby', 'circles', 'events', 'recommendations', 'photos']
    },
    EVENT: {
        type: 'event',
        enabledModules: ['feed', 'members', 'connections', 'circles', 'events', 'chat', 'announcements'],
        memberFilters: ['attending_day', 'attending_session', 'first_time_attendee', 'same_city', 'open_to_meet'],
        postTypes: ['text', 'image', 'question', 'announcement', 'session_discussion', 'event_photo'],
        homeWidgets: ['event_feed', 'schedule', 'attendees', 'sessions', 'meetup_spots', 'event_circles', 'announcements', 'photos']
    },
    PRIVATE: {
        type: 'private',
        enabledModules: ['feed', 'members', 'connections', 'circles', 'events', 'chat', 'announcements'],
        memberFilters: ['role', 'joined_recently', 'available_for_event', 'subgroup'],
        postTypes: ['text', 'image', 'question', 'announcement', 'event'],
        homeWidgets: ['private_feed', 'members', 'circle_chat', 'events', 'announcements', 'shared_updates']
    },
    ORGANIZATION: {
        type: 'organization',
        enabledModules: ['feed', 'members', 'connections', 'circles', 'events', 'chat', 'announcements'],
        memberFilters: ['chapter', 'city', 'batch', 'department', 'role', 'volunteer_status', 'attendee'],
        postTypes: ['text', 'image', 'question', 'announcement', 'event', 'program_post', 'feedback'],
        homeWidgets: ['organization_feed', 'announcements', 'members', 'programs', 'events', 'circles', 'resources', 'about']
    }
};

const proposeEnvironment = async (userId, data) => {
    let slug = data.slug || generateSlug(data.name);
    
    // Ensure slug is unique
    const existing = await prisma.environment.findUnique({ where: { slug } });
    if (existing) {
        slug = `${slug}-${Date.now().toString().slice(-4)}`;
    }

    const category = (data.category || 'COLLEGE').toUpperCase();
    const config = CONFIG_MAP[category] || CONFIG_MAP.COLLEGE;

    return await prisma.environment.create({
        data: {
            collegeId: data.collegeId || null,
            name: data.name,
            slug: slug,
            coverImage: data.coverImage || null,
            description: data.description,
            type: data.type || 'HUB',
            category: category,
            config: config,
            location: data.location || null,
            tags: data.tags || [],
            privacyType: data.privacyType || 'PUBLIC',
            privacyLevel: data.privacyLevel || 'PUBLIC',
            joinQuestions: data.joinQuestions || [],
            joinCriteria: data.joinCriteria || "",
            status: 'PENDING',
            members: {
                create: {
                    userId,
                    role: 'ADMIN',
                    status: 'APPROVED'
                }
            }
        }
    });
};

const getEnvironmentById = async (environmentId, userId) => {
    const hub = await prisma.environment.findUnique({
        where: { id: environmentId },
        include: {
            _count: { select: { members: { where: { status: 'APPROVED' } } } },
            members: {
                where: { userId },
                select: { status: true, role: true }
            }
        }
    });
    
    if (!hub) return null;
    
    return {
        ...hub,
        memberCount: hub._count.members,
        userStatus: hub.members[0]?.status || 'NONE',
        userRole: hub.members[0]?.role || null
    };
};

const getEnvironmentLeaderboard = async (environmentId) => {
    // Get all users who are approved members of this environment, ordered by reputation score
    const memberships = await prisma.environmentMembership.findMany({
        where: { environmentId, status: 'APPROVED' },
        include: {
            user: {
                select: {
                    id: true,
                    name: true,
                    avatar: true,
                    reputationScore: true
                }
            }
        }
    });
    
    return memberships
        .map(m => ({
            id: m.user.id,
            name: m.user.name,
            avatar: m.user.avatar,
            reputation: m.user.reputationScore
        }))
        .sort((a, b) => b.reputation - a.reputation);
};

const requestToJoin = async (userId, environmentId, answers = {}) => {
    const hub = await prisma.environment.findUnique({ where: { id: environmentId } });
    if (!hub) throw new Error('Hub not found');

    const initialState = hub.privacyLevel === 'PUBLIC' ? 'APPROVED' : 'PENDING';

    return await prisma.environmentMembership.upsert({
        where: {
            userId_environmentId: { userId, environmentId }
        },
        update: {
            status: initialState,
            answers
        },
        create: {
            userId,
            environmentId,
            status: initialState,
            answers
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

const listAllGlobalPendingProposals = async () => {
    return await prisma.environment.findMany({
        where: { status: 'PENDING' },
        include: { 
            college: { select: { name: true } },
            members: {
                where: { role: 'ADMIN' },
                include: { user: { select: { name: true, email: true } } }
            }
        },
        orderBy: { createdAt: 'desc' }
    });
};

const reviewGlobalProposal = async (environmentId, status) => {
    const finalStatus = status.toUpperCase() === 'APPROVED' ? 'VERIFIED' : 'REJECTED';
    return await prisma.environment.update({
        where: { id: environmentId },
        data: { status: finalStatus }
    });
};

const listMembers = async (environmentId) => {
    return await prisma.environmentMembership.findMany({
        where: { environmentId, status: 'APPROVED' },
        include: { user: { select: { id: true, name: true, avatar: true, department: true, batch_year: true, targetRole: true, location: true } } }
    });
};

const listCircles = async (environmentId) => {
    return await prisma.circle.findMany({
        where: { environmentId },
        include: {
            _count: { select: { members: true } }
        }
    });
};

const createCircle = async (environmentId, userId, data) => {
    const membership = await prisma.environmentMembership.findUnique({
        where: { userId_environmentId: { userId, environmentId } }
    });
    if (!membership || membership.status !== 'APPROVED') {
        throw new Error('Must be an approved environment member to create a circle');
    }

    return await prisma.circle.create({
        data: {
            environmentId,
            name: data.name,
            description: data.description,
            coverImage: data.coverImage || null,
            privacy: data.privacy || 'PUBLIC',
            rules: data.rules || [],
            members: {
                create: {
                    userId,
                    role: 'ADMIN'
                }
            }
        }
    });
};

const listEvents = async (environmentId) => {
    return await prisma.event.findMany({
        where: { environmentId },
        include: {
            createdBy: { select: { name: true, avatar: true } },
            _count: { select: { attendees: true } }
        }
    });
};

module.exports = {
    listEnvironments,
    proposeEnvironment,
    requestToJoin,
    manageMembership,
    listPendingMembers,
    listAllGlobalPendingProposals,
    reviewGlobalProposal,
    listMembers,
    listCircles,
    createCircle,
    listEvents,
    getEnvironmentById,
    getEnvironmentLeaderboard
};
