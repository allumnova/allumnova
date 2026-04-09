const express = require('express');
const router = express.Router();
const profileController = require('./profile.controller');
const { authenticate } = require('../../middlewares/auth.middleware');
const upload = require('../../utils/upload');

router.get('/check-username', profileController.checkUsernameAvailability);
router.get('/', authenticate, profileController.getMyProfile);
router.get('/me', authenticate, profileController.getMyProfile);
router.patch('/me', authenticate, upload.fields([{ name: 'avatar', maxCount: 1 }, { name: 'resume', maxCount: 1 }]), profileController.updateMyProfile);
router.patch('/', authenticate, upload.fields([{ name: 'avatar', maxCount: 1 }, { name: 'resume', maxCount: 1 }]), profileController.updateMyProfile);
router.patch('', authenticate, upload.fields([{ name: 'avatar', maxCount: 1 }, { name: 'resume', maxCount: 1 }]), profileController.updateMyProfile);
router.post('/onboarding', authenticate, upload.single('document'), profileController.completeOnboarding);
router.get('/admin/pending-verifications', authenticate, profileController.getPendingVerifications);
router.post('/admin/verify-user', authenticate, profileController.verifyUser);
router.get('/portfolio/:username', profileController.getPortfolioByUsername);
router.get('/u/:username', profileController.getPortfolioByUsername);
router.get('/:userId', authenticate, profileController.getPublicProfile);
router.put('/pulse', authenticate, profileController.updatePulse);

// Career Sections
router.post('/experience', authenticate, profileController.addExperience);
router.delete('/experience/:id', authenticate, profileController.deleteExperience);

router.post('/education', authenticate, profileController.addEducation);
router.delete('/education/:id', authenticate, profileController.deleteEducation);

router.post('/certification', authenticate, profileController.addCertification);
router.delete('/certification/:id', authenticate, profileController.deleteCertification);

module.exports = router;
