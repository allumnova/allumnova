const express = require('express');
const router = express.Router();
const environmentController = require('./environment.controller');
const { authenticate, isAdmin } = require('../../middlewares/auth.middleware');

router.get('/', authenticate, environmentController.listHubs);
router.post('/', authenticate, environmentController.sendProposal);
router.post('/:hubId/join', authenticate, environmentController.joinHub);
router.patch('/membership/:id', authenticate, environmentController.updateMembership);
router.get('/:hubId/pending', authenticate, environmentController.getPendingHubRequests);

// Admin Routes
router.get('/admin/all-pending', authenticate, isAdmin, environmentController.getAllPendingProposals);
router.post('/admin/review', authenticate, isAdmin, environmentController.adminReviewProposal);

module.exports = router;
