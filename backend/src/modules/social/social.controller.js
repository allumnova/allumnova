const socialService = require('./social.service');
const prisma = require('../../models');

const getSuggestions = async (req, res) => {
    try {
        const collegeId = req.headers['x-college-id'];
        const environmentId = req.query.environmentId || req.query.hubId || req.headers['x-environment-id'];
        if (!collegeId && !environmentId) return res.status(400).json({ message: 'College ID or Environment ID required' });
        const suggestions = await socialService.getRecommendedPeers(req.user.userId, collegeId, environmentId);
        res.json(suggestions);
    } catch (error) {
        console.error('getSuggestions error:', error);
        res.status(500).json({ message: error.message });
    }
};

const getDiscover = async (req, res) => {
    try {
        const collegeId = req.headers['x-college-id'];
        const { cursor, limit, search, role, batchYear, environmentId, hubId } = req.query;
        const users = await socialService.discoverUsers(
            req.user.userId, 
            collegeId, 
            cursor, 
            limit ? parseInt(limit) : 20,
            search,
            role,
            batchYear,
            environmentId || hubId || req.headers['x-environment-id']
        );
        res.json(users);
    } catch (error) {
        console.error('getDiscover error:', error);
        res.status(500).json({ message: error.message });
    }
};

const getAlumni = async (req, res) => {
    try {
        const collegeId = req.headers['x-college-id'];
        const { cursor, search } = req.query;
        const users = await socialService.listAlumni(
            collegeId, 
            req.user.userId, 
            cursor, 
            20, 
            search
        );
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const sendRequest = async (req, res) => {
    try {
        const { receiverId, intent, note } = req.body;
        const connection = await socialService.sendConnectionRequest(req.user.userId, receiverId, intent, note);
        res.status(201).json(connection);
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

const acceptRequest = async (req, res) => {
    try {
        const { requestId } = req.body;
        const connection = await socialService.acceptConnectionRequest(requestId, req.user.userId);
        res.json(connection);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const declineRequest = async (req, res) => {
    try {
        const { requestId } = req.body;
        const result = await socialService.declineConnectionRequest(requestId, req.user.userId);
        res.json(result);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getConnections = async (req, res) => {
    try {
        const connections = await socialService.listConnections(req.user.userId);
        res.json(connections);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getNotifications = async (req, res) => {
    try {
        const notifications = await socialService.getNotifications(req.user.userId);
        res.json(notifications);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getPendingRequests = async (req, res) => {
    try {
        const requests = await socialService.listPendingRequests(req.user.userId);
        res.json(requests);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const removeConnection = async (req, res) => {
    try {
        const { userId } = req.params;
        const result = await socialService.removeConnection(req.user.userId, userId);
        res.json({ success: true, count: result.count });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getSuggestions,
    getDiscover,
    getAlumni,
    sendRequest,
    acceptRequest,
    declineRequest,
    getConnections,
    getNotifications,
    getPendingRequests,
    removeConnection
};
