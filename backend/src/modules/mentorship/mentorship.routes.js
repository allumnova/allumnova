const express = require('express');
const router = express.Router();
const mentorshipController = require('./mentorship.controller');
const { authenticate } = require('../../middlewares/auth.middleware');

router.post('/request', authenticate, mentorshipController.sendRequest);
router.get('/requests', authenticate, mentorshipController.getRequests);
router.patch('/status', authenticate, mentorshipController.updateStatus);

module.exports = router;
