const express = require('express');
const router = express.Router();
const roadmapController = require('./roadmap.controller');
const { authenticate, checkCollegeAccess } = require('../../middlewares/auth.middleware');

router.get('/', authenticate, checkCollegeAccess, roadmapController.getRoadmapsFiltered);
router.get('/:id', authenticate, roadmapController.getRoadmapById);
router.post('/complete-step', authenticate, roadmapController.completeStep);
router.post('/', authenticate, checkCollegeAccess, roadmapController.createRoadmap);

module.exports = router;
