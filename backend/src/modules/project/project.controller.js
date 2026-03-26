const projectService = require('./project.service');

const projectController = {
    createProject: async (req, res) => {
        try {
            const { collegeId, ...projectData } = req.body;
            const project = await projectService.createProject(req.user.id, collegeId, projectData);
            res.json({ success: true, project });
        } catch (error) {
            console.error('Create project error:', error);
            res.status(500).json({ success: false, message: error.message });
        }
    },

    getCollegeProjects: async (req, res) => {
        try {
            const { collegeId } = req.params;
            const projects = await projectService.getCollegeProjects(collegeId, req.user?.id);
            res.json({ success: true, projects });
        } catch (error) {
            console.error('Get projects error:', error);
            res.status(500).json({ success: false, message: error.message });
        }
    },

    addHype: async (req, res) => {
        try {
            const { projectId } = req.params;
            const hype = await projectService.addHype(projectId, req.user.id);
            res.json({ success: true, hype });
        } catch (error) {
            console.error('Add hype error:', error);
            res.status(500).json({ success: false, message: error.message });
        }
    },

    updateMilestone: async (req, res) => {
        try {
            const { milestoneId } = req.params;
            const { isCompleted } = req.body;
            const milestone = await projectService.updateMilestone(milestoneId, isCompleted);
            res.json({ success: true, milestone });
        } catch (error) {
            console.error('Update milestone error:', error);
            res.status(500).json({ success: false, message: error.message });
        }
    }
};

module.exports = projectController;
