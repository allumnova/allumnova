const express = require('express');
const router = express.Router();
const socialController = require('./social.controller');
const researchController = require('./research.controller');
const { authenticate } = require('../../middlewares/auth.middleware');

router.get('/discovery-brief', authenticate, researchController.getBrief);
router.get('/connect/pending', authenticate, socialController.getPendingRequests);
router.get('/discover', authenticate, socialController.getDiscover);
router.get('/alumni', authenticate, socialController.getAlumni);
router.get('/suggestions', authenticate, socialController.getSuggestions);
router.post('/connect', authenticate, socialController.sendRequest);
router.post('/connect/accept', authenticate, socialController.acceptRequest);
router.post('/connect/decline', authenticate, socialController.declineRequest);
router.get('/connections', authenticate, socialController.getConnections);
router.delete('/connections/:userId', authenticate, socialController.removeConnection);
router.get('/notifications', authenticate, socialController.getNotifications);

module.exports = router;
