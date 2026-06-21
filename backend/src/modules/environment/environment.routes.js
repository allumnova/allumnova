const express = require('express');
const router = express.Router();
const environmentController = require('./environment.controller');
const { authenticate, isAdmin } = require('../../middlewares/auth.middleware');

router.get('/', authenticate, environmentController.listHubs);
router.post('/', authenticate, environmentController.sendProposal);
router.get('/:hubId', authenticate, environmentController.getHubDetails);
router.get('/:hubId/leaderboard', authenticate, environmentController.getHubLeaderboard);
router.post('/:hubId/join', authenticate, environmentController.joinHub);
router.post('/join/:hubId', authenticate, environmentController.joinHub);
router.patch('/membership/:id', authenticate, environmentController.updateMembership);
router.get('/:hubId/pending', authenticate, environmentController.getPendingHubRequests);

// Admin Routes
router.get('/admin/all-pending', authenticate, isAdmin, environmentController.getAllPendingProposals);
router.post('/admin/review', authenticate, isAdmin, environmentController.adminReviewProposal);

// Environment Sub-resources
router.get('/:hubId/members', authenticate, environmentController.getMembers);
router.get('/:hubId/circles', authenticate, environmentController.getCircles);
router.post('/:hubId/circles', authenticate, environmentController.addCircle);
router.get('/:hubId/events', authenticate, environmentController.getEvents);

module.exports = router;
