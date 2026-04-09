const researchService = require('./research.service');

exports.getBrief = async (req, res) => {
    try {
        const collegeId = req.headers['x-college-id'];
        if (!collegeId) {
            return res.status(400).json({ message: 'College ID is required in headers' });
        }

        const brief = await researchService.getDiscoveryBrief(req.user.userId, collegeId);
        res.json(brief);
    } catch (error) {
        console.error('Research Agent Error:', error);
        res.status(500).json({ message: error.message });
    }
};
