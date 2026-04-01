const environmentService = require('./environment.service');

exports.getEnvironments = async (req, res) => {
    try {
        const collegeId = req.header('X-College-ID');
        if (!collegeId) return res.status(400).json({ message: 'College ID required' });
        const environments = await environmentService.listEnvironments(collegeId);
        res.json(environments);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.joinEnvironment = async (req, res) => {
    try {
        const { environmentId } = req.body;
        if (!environmentId) return res.status(400).json({ message: 'Environment ID required' });
        const membership = await environmentService.joinEnvironment(req.user.userId, environmentId);
        res.json(membership);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.proposeEnvironment = async (req, res) => {
    try {
        const collegeId = req.collegeId || req.header('X-College-ID');
        if (!collegeId) return res.status(400).json({ success: false, message: 'College ID required' });
        
        const environment = await environmentService.proposeEnvironment(collegeId, req.user.userId, req.body);
        res.status(201).json({ success: true, data: environment });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
