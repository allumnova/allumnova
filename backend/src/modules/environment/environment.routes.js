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
router.post('/circles/:circleId/join', authenticate, environmentController.joinCircle);
router.post('/circles/:circleId/leave', authenticate, environmentController.leaveCircle);
router.get('/:hubId/events', authenticate, environmentController.getEvents);
router.post('/:hubId/events', authenticate, environmentController.createEvent);
router.post('/events/:eventId/rsvp', authenticate, environmentController.rsvpEvent);

module.exports = router;
