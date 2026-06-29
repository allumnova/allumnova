const environmentService = require('./environment.service');

const listHubs = async (req, res) => {
    try {
        const collegeId = req.headers['x-college-id'] || req.query.collegeId;
        const category = req.query.category;
        const hubs = await environmentService.listEnvironments({ collegeId, category }, req.user.userId);
        res.json(hubs);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const sendProposal = async (req, res) => {
    try {
        const hub = await environmentService.proposeEnvironment(req.user.userId, req.body);
        res.status(201).json(hub);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const joinHub = async (req, res) => {
    try {
        const { hubId } = req.params;
        const { answers } = req.body;
        const membership = await environmentService.requestToJoin(req.user.userId, hubId, answers);
        res.json(membership);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const updateMembership = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        const updated = await environmentService.manageMembership(id, status, req.user.userId);
        res.json(updated);
    } catch (error) {
        res.status(403).json({ message: error.message });
    }
};

const getPendingHubRequests = async (req, res) => {
    try {
        const { hubId } = req.params;
        const pending = await environmentService.listPendingMembers(hubId, req.user.userId);
        res.json(pending);
    } catch (error) {
        res.status(403).json({ message: error.message });
    }
};

const getAllPendingProposals = async (req, res) => {
    try {
        const result = await environmentService.listAllGlobalPendingProposals();
        res.json({ success: true, data: result });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

const adminReviewProposal = async (req, res) => {
    try {
        const { environmentId, status } = req.body;
        const result = await environmentService.reviewGlobalProposal(environmentId, status);
        res.json({ success: true, data: result });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

const getMembers = async (req, res) => {
    try {
        const { hubId } = req.params;
        const members = await environmentService.listMembers(hubId);
        res.json(members);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getCircles = async (req, res) => {
    try {
        const { hubId } = req.params;
        const circles = await environmentService.listCircles(hubId, req.user.userId);
        res.json(circles);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const addCircle = async (req, res) => {
    try {
        const { hubId } = req.params;
        const circle = await environmentService.createCircle(hubId, req.user.userId, req.body);
        res.status(201).json(circle);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const joinCircle = async (req, res) => {
    try {
        const { circleId } = req.params;
        const membership = await environmentService.joinCircle(circleId, req.user.userId);
        res.status(201).json(membership);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const leaveCircle = async (req, res) => {
    try {
        const { circleId } = req.params;
        await environmentService.leaveCircle(circleId, req.user.userId);
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getEvents = async (req, res) => {
    try {
        const { hubId } = req.params;
        const events = await environmentService.listEvents(hubId, req.user.userId);
        res.json(events);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const createEvent = async (req, res) => {
    try {
        const { hubId } = req.params;
        const event = await environmentService.createEvent(hubId, req.user.userId, req.body);
        res.status(201).json(event);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const rsvpEvent = async (req, res) => {
    try {
        const { eventId } = req.params;
        const result = await environmentService.rsvpEvent(eventId, req.user.userId);
        res.json(result);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getHubDetails = async (req, res) => {
    try {
        const { hubId } = req.params;
        const hub = await environmentService.getEnvironmentById(hubId, req.user.userId);
        if (!hub) {
            return res.status(404).json({ message: 'Environment not found' });
        }
        res.json(hub);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getHubLeaderboard = async (req, res) => {
    try {
        const { hubId } = req.params;
        const leaderboard = await environmentService.getEnvironmentLeaderboard(hubId);
        res.json(leaderboard);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    listHubs,
    sendProposal,
    joinHub,
    updateMembership,
    getPendingHubRequests,
    getAllPendingProposals,
    adminReviewProposal,
    getMembers,
    getCircles,
    addCircle,
    joinCircle,
    leaveCircle,
    getEvents,
    createEvent,
    rsvpEvent,
    getHubDetails,
    getHubLeaderboard
};
