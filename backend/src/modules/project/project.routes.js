const express = require('express');
const router = express.Router();
const projectController = require('./project.controller');
const { authenticate } = require('../../middlewares/auth.middleware');

router.post('/', authenticate, projectController.createProject);
router.get('/college/:collegeId', authenticate, projectController.getCollegeProjects);
router.post('/:projectId/hype', authenticate, projectController.addHype);
router.patch('/:projectId', authenticate, projectController.updateProject);
router.delete('/:projectId', authenticate, projectController.deleteProject);
router.patch('/milestones/:milestoneId', authenticate, projectController.updateMilestone);

module.exports = router;
