const express = require('express');
const router = express.Router();
const aiController = require('./ai.controller');
const { authenticate } = require('../../middlewares/auth.middleware');

router.post('/chat', authenticate, aiController.chat);
router.post('/requirements/extract', authenticate, aiController.extractRequirements);
router.post('/proposal/generate', authenticate, aiController.generateProposal);
router.get('/metrics', authenticate, aiController.getMetrics);

module.exports = router;
