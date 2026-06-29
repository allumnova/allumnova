const express = require('express');
const router = express.Router();
const projectController = require('./project.controller');
const { authenticate } = require('../../middlewares/auth.middleware');

router.get('/', authenticate, projectController.getProjects);
router.post('/', authenticate, projectController.createProject);
router.get('/:projectId', authenticate, projectController.getProjectById);
router.patch('/:projectId', authenticate, projectController.updateProject);
router.delete('/:projectId', authenticate, projectController.deleteProject);

// Task management routes
router.post('/:projectId/tasks', authenticate, projectController.createTask);
router.patch('/tasks/:taskId', authenticate, projectController.updateTask);
router.delete('/tasks/:taskId', authenticate, projectController.deleteTask);

module.exports = router;
