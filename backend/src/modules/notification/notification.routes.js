const express = require('express');
const router = express.Router();
const notificationController = require('./notification.controller');
const { authenticate } = require('../../middlewares/auth.middleware');

router.get('/', authenticate, notificationController.getMyNotifications);
router.put('/read-all', authenticate, notificationController.markAllRead);
router.put('/:id/read', authenticate, notificationController.markRead);

module.exports = router;
