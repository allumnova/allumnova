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
            const { search } = req.query;
            const projects = await projectService.getCollegeProjects(collegeId, req.user?.userId, search);
            res.json({ success: true, projects });
        } catch (error) {
            console.error('Get projects error:', error);
            res.status(500).json({ success: false, message: error.message });
        }
    },

    updateProject: async (req, res) => {
        try {
            const { projectId } = req.params;
            const project = await projectService.updateProject(projectId, req.user.userId, req.body);
            res.json({ success: true, project });
        } catch (error) {
            console.error('Update project error:', error);
            res.status(500).json({ success: false, message: error.message });
        }
    },

    deleteProject: async (req, res) => {
        try {
            const { projectId } = req.params;
            const result = await projectService.deleteProject(projectId, req.user.userId);
            res.json(result);
        } catch (error) {
            console.error('Delete project error:', error);
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
