const environmentService = require('./environment.service');

const listHubs = async (req, res) => {
    try {
        const collegeId = req.headers['x-college-id'];
        const hubs = await environmentService.listEnvironments(collegeId, req.user.userId);
        res.json(hubs);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const sendProposal = async (req, res) => {
    try {
        const collegeId = req.headers['x-college-id'];
        const hub = await environmentService.proposeEnvironment(collegeId, req.user.userId, req.body);
        res.status(201).json(hub);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const joinHub = async (req, res) => {
    try {
        const { hubId } = req.params;
        const membership = await environmentService.requestToJoin(req.user.userId, hubId);
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

module.exports = {
    listHubs,
    sendProposal,
    joinHub,
    updateMembership,
    getPendingHubRequests
};
