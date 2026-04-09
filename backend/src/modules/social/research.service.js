const prisma = require('../../models');

/**
 * The Research Agent Discovery Engine
 * 
 * Logic:
 * 1. Extract Target User Signals (Skills, Interests, Goals).
 * 2. Scan College Corpus (Peers, Hubs, Projects).
 * 3. Calculate "Signal Matching Score" based on:
 *    - Direct Interest Intersection (Social Alignment)
 *    - Complementary Skills (Project Building Potential - e.g., Backend + UI)
 *    - Career Goal Alignment (Mentorship/Peer Groups)
 */

exports.getDiscoveryBrief = async (userId, collegeId) => {
    // 1. Fetch the Target User Profile
    const currentUser = await prisma.user.findUnique({
        where: { id: userId },
        select: {
            id: true,
            techSkills: true,
            interests: true,
            careerObjective: true,
            targetRole: true,
            skills: true
        }
    });

    if (!currentUser) throw new Error('User not found');

    // Prepare keywords for matching
    const userSkills = [...(currentUser.skills || []), ...(Object.keys(currentUser.techSkills || {}))].map(s => s.toLowerCase());
    const userInterests = (currentUser.interests || []).map(i => i.toLowerCase());
    const userGoals = (currentUser.careerObjective || '').toLowerCase();

    // 2. Discover High-Signal Peers (Complementary & Aligned)
    const potentialPeers = await prisma.user.findMany({
        where: {
            id: { not: userId },
            colleges: { some: { collegeId, status: 'VERIFIED' } },
            isPublic: true
        },
        select: {
            id: true,
            name: true,
            avatar: true,
            reputationScore: true,
            techSkills: true,
            interests: true,
            targetRole: true,
            skills: true,
            pulse: true,
            pulseEmoji: true
        },
        take: 50 // Pull a candidate pool for local scoring
    });

    const peers = potentialPeers.map(peer => {
        const peerSkills = [...(peer.skills || []), ...(Object.keys(peer.techSkills || {}))].map(s => s.toLowerCase());
        const peerInterests = (peer.interests || []).map(i => i.toLowerCase());
        
        // Calculate Score
        let score = 0;
        let matchReason = "";

        // Complementary Match (e.g. Frontend vs Backend)
        const hasFrontend = userSkills.some(s => /front|react|ui|design/i.test(s));
        const peerHasBackend = peerSkills.some(s => /back|node|api|db|rust|go/i.test(s));
        const hasBackend = userSkills.some(s => /back|node|api|db|rust|go/i.test(s));
        const peerHasFrontend = peerSkills.some(s => /front|react|ui|design/i.test(s));

        if ((hasFrontend && peerHasBackend) || (hasBackend && peerHasFrontend)) {
            score += 40;
            matchReason = "Complementary skill match for project building";
        }

        // Shared Interests
        const sharedInterests = userInterests.filter(i => peerInterests.includes(i));
        if (sharedInterests.length > 0) {
            score += sharedInterests.length * 15;
            matchReason = matchReason || `Shared interest in ${sharedInterests[0]}`;
        }

        // Career Goal Alignment
        if (currentUser.targetRole && peer.targetRole && currentUser.targetRole.toLowerCase() === peer.targetRole.toLowerCase()) {
            score += 25;
            matchReason = matchReason || "Aligned career trajectory";
        }

        return { ...peer, score, matchReason };
    })
    .filter(p => p.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 5);

    // 3. Discover Aligned Societies (Environments)
    const potentialHubs = await prisma.environment.findMany({
        where: { collegeId, status: 'VERIFIED', privacyLevel: { in: ['PUBLIC', 'SOCIETY'] } },
        include: { _count: { select: { members: { where: { status: 'APPROVED' } } } } }
    });

    const societies = potentialHubs.map(hub => {
        let score = 0;
        const hubDescription = (hub.description || '').toLowerCase();
        
        // Match descriptions against interests
        const matchCount = userInterests.filter(i => hubDescription.includes(i)).length;
        score += matchCount * 20;

        // Interest overlap
        if (userInterests.some(i => hub.name.toLowerCase().includes(i))) score += 50;

        return { 
            id: hub.id, 
            name: hub.name, 
            type: hub.type, 
            privacyLevel: hub.privacyLevel,
            memberCount: hub._count.members, 
            score,
            icon: hub.icon
        };
    })
    .filter(h => h.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 3);

    // 4. Discover Signal Projects
    const potentialProjects = await prisma.project.findMany({
        where: { collegeId, lookingFor: { not: null } },
        include: { owner: { select: { name: true, avatar: true } } }
    });

    const projects = potentialProjects.map(project => {
        let score = 0;
        const lookingFor = (project.lookingFor || '').toLowerCase();
        
        // Does the project need skills the user has?
        const skillMatch = userSkills.some(s => lookingFor.includes(s));
        if (skillMatch) score += 60;

        return {
            id: project.id,
            title: project.title,
            owner: project.owner,
            lookingFor: project.lookingFor,
            score
        };
    })
    .filter(p => p.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 3);

    return {
        timestamp: new Date(),
        peers,
        societies,
        projects,
        briefing: "I've analyzed your professional signals. You're currently optimized for collaboration with builders in same campus. I've curated a few high-signal matches that align with your career objective."
    };
};
