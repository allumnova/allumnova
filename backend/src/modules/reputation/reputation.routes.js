const express = require('express');
const router = express.Router();
const reputationController = require('./reputation.controller');
const { authenticate } = require('../../middlewares/auth.middleware');

router.get('/me', authenticate, reputationController.getMyReputation);
router.get('/tiers', reputationController.getTiers);

module.exports = router;
