const socialService = require('./social.service');
const prisma = require('../../models');

exports.getDiscover = async (req, res) => {
    try {
        const collegeId = req.headers['x-college-id'];
        const { cursor, limit, search, role, batchYear } = req.query;
        const users = await socialService.discoverUsers(
            req.user.userId, 
            collegeId, 
            cursor, 
            limit ? parseInt(limit) : 20,
            search,
            role,
            batchYear
        );
        res.json(users);
    } catch (error) {
        console.error('getDiscover error:', error);
        res.status(500).json({ message: error.message });
    }
};

exports.sendRequest = async (req, res) => {
    try {
        const { receiverId } = req.body;
        console.log(`DEBUG: sendRequest from ${req.user.userId} to ${receiverId}`);
        const connection = await socialService.sendConnectionRequest(req.user.userId, receiverId);
        res.status(201).json(connection);
    } catch (error) {
        console.error('sendRequest error:', error);
        res.status(500).json({ message: error.message });
    }
};

exports.acceptRequest = async (req, res) => {
    try {
        const { requestId, notificationId } = req.body;
        // If notificationId is provided, find the connectionId (targetId) from it
        let actualRequestId = requestId;

        if (notificationId && !actualRequestId) {
            const notification = await prisma.notification.findUnique({
                where: { id: notificationId }
            });
            if (notification) actualRequestId = notification.targetId;
        }

        if (!actualRequestId) {
            return res.status(400).json({ message: 'Missing requestId or valid notificationId' });
        }

        const connection = await socialService.acceptConnectionRequest(actualRequestId, req.user.userId);
        res.json(connection);
    } catch (error) {
        console.error('acceptRequest error:', error);
        res.status(500).json({ message: error.message });
    }
};

exports.declineRequest = async (req, res) => {
    try {
        const { requestId, notificationId } = req.body;
        let actualRequestId = requestId;

        if (notificationId && !actualRequestId) {
            const notification = await prisma.notification.findUnique({
                where: { id: notificationId }
            });
            if (notification) actualRequestId = notification.targetId;
        }

        if (!actualRequestId) {
            return res.status(400).json({ message: 'Missing requestId or valid notificationId' });
        }

        const result = await socialService.declineConnectionRequest(actualRequestId, req.user.userId);
        res.json(result);
    } catch (error) {
        console.error('declineRequest error:', error);
        res.status(500).json({ message: error.message });
    }
};

exports.getConnections = async (req, res) => {
    try {
        const connections = await socialService.listConnections(req.user.userId);
        res.json(connections);
    } catch (error) {
        console.error('getConnections error:', error);
        res.status(500).json({ message: error.message });
    }
};

exports.getNotifications = async (req, res) => {
    try {
        // Return pending connection requests as notifications
        const notifications = await socialService.getNotifications(req.user.userId);
        res.json(notifications);
    } catch (error) {
        console.error('getNotifications error:', error);
        res.status(500).json({ message: error.message });
    }
};

exports.getPendingRequests = async (req, res) => {
    try {
        const requests = await socialService.listPendingRequests(req.user.userId);
        res.json(requests);
    } catch (error) {
        console.error('getPendingRequests error:', error);
        res.status(500).json({ message: error.message });
    }
};

exports.removeConnection = async (req, res) => {
    try {
        const { userId } = req.params;
        const result = await socialService.removeConnection(req.user.userId, userId);
        res.json({ success: true, count: result.count });
    } catch (error) {
        console.error('removeConnection error:', error);
        res.status(500).json({ message: error.message });
    }
};
