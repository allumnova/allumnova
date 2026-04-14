const collegeService = require('./college.service');

const listColleges = async (req, res) => {
    try {
        const colleges = await collegeService.getAllColleges();
        res.status(200).json({ success: true, data: colleges });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

const switchCollege = async (req, res) => {
    try {
        const { subdomain } = req.params;
        const college = await collegeService.getCollegeBySubdomain(subdomain);

        if (!college) {
            return res.status(404).json({ success: false, error: 'College not found' });
        }

        // Check if user belongs to this college and is approved
        const hasAccess = req.user.colleges.some(c => c.id === college.id);
        if (!hasAccess) {
            return res.status(403).json({ success: false, error: 'You do not have approved access to this college' });
        }

        res.status(200).json({ success: true, data: college });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

const requestJoin = async (req, res) => {
    try {
        const { collegeId, role } = req.body;
        const result = await collegeService.joinCollege(req.user.userId, collegeId, role);
        res.status(201).json({ success: true, data: result });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
};

const approveRequest = async (req, res) => {
    try {
        const { mappingId, status } = req.body; // status: 'approved' or 'rejected'
        const result = await collegeService.respondToJoinRequest(mappingId, status);
        res.status(200).json({ success: true, data: result });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
};

const listPendingRequests = async (req, res) => {
    try {
        const { collegeId } = req.params;
        const requests = await collegeService.getPendingRequests(collegeId);
        res.status(200).json({ success: true, data: requests });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
};

const suggestCollege = async (req, res) => {
    try {
        const result = await collegeService.suggestCollege(req.user.userId, req.body);
        res.status(201).json({ success: true, data: result });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
};

const listMyRequests = async (req, res) => {
    try {
        const result = await collegeService.getMyCollegeRequests(req.user.userId);
        res.json({ success: true, data: result });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
};

const listAllRequests = async (req, res) => {
    try {
        const result = await collegeService.listAllCollegeRequests();
        console.log(`[Admin] Retrieved ${result.length} hub creation requests.`);
        res.json({ success: true, data: result });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
};

const reviewRequest = async (req, res) => {
    try {
        const { requestId, status, updates } = req.body;
        const result = await collegeService.reviewCollegeRequest(requestId, status, updates);
        res.json({ success: true, data: result });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
};

module.exports = {
    listColleges,
    switchCollege,
    requestJoin,
    approveRequest,
    listPendingRequests,
    suggestCollege,
    listMyRequests,
    listAllRequests,
    reviewRequest
};
