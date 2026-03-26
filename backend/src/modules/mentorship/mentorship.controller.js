const mentorshipService = require('./mentorship.service');

exports.sendRequest = async (req, res) => {
    try {
        const { alumniId, message } = req.body;
        const request = await mentorshipService.requestMentorship(req.user.userId, alumniId, message);
        res.status(201).json(request);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getRequests = async (req, res) => {
    try {
        const role = req.user.role || 'student'; // Logic might need adjustment based on token payload
        const requests = await mentorshipService.getMentorshipRequests(req.user.userId, role);
        res.json(requests);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.updateStatus = async (req, res) => {
    try {
        const { requestId, status } = req.body;
        if (!['accepted', 'declined'].includes(status)) {
            return res.status(400).json({ message: 'Invalid status. Must be accepted or declined.' });
        }
        const updated = await mentorshipService.updateMentorshipStatus(requestId, req.user.userId, status);
        res.json(updated);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
