const express = require('express');
const router = express.Router();
const profileController = require('./profile.controller');
const { authenticate } = require('../../middlewares/auth.middleware');
const upload = require('../../utils/upload');

router.get('/', authenticate, profileController.getMyProfile);
router.get('/me', authenticate, profileController.getMyProfile);
router.patch('/me', authenticate, upload.single('avatar'), profileController.updateMyProfile);
router.post('/onboarding', authenticate, upload.single('document'), profileController.completeOnboarding);
router.get('/admin/pending-verifications', authenticate, profileController.getPendingVerifications);
router.post('/admin/verify-user', authenticate, profileController.verifyUser);
router.get('/:userId', authenticate, profileController.getPublicProfile);
router.put('/pulse', authenticate, profileController.updatePulse);

module.exports = router;
