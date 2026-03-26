const roadmapService = require('./roadmap.service');

exports.getRoadmapsFiltered = async (req, res) => {
    try {
        const collegeId = req.headers['x-college-id'];
        if (!collegeId) return res.status(400).json({ message: 'College ID required' });
        
        const { category } = req.query;
        const roadmaps = await roadmapService.getRoadmaps(collegeId, category);
        res.json(roadmaps);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getRoadmapById = async (req, res) => {
    try {
        const { id } = req.params;
        const roadmap = await roadmapService.getRoadmapDetails(id, req.user.userId);
        res.json(roadmap);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.completeStep = async (req, res) => {
    try {
        const { stepId } = req.body;
        if (!stepId) return res.status(400).json({ message: 'Step ID required' });
        
        const result = await roadmapService.markStepComplete(req.user.userId, stepId);
        res.json(result);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.createRoadmap = async (req, res) => {
    try {
        const collegeId = req.headers['x-college-id'];
        if (!collegeId) return res.status(400).json({ message: 'College ID required' });

        const data = {
            ...req.body,
            authorId: req.user.userId,
            collegeId
        };
        const roadmap = await roadmapService.createRoadmap(data);
        res.status(201).json(roadmap);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
