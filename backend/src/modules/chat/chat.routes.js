const express = require('express');
const router = express.Router();
const chatController = require('./chat.controller');
const { authenticate } = require('../../middlewares/auth.middleware');
const upload = require('../../utils/upload');

router.get('/conversations', authenticate, chatController.getConversations);
router.get('/messages/:conversationId', authenticate, chatController.getMessages);
router.post('/messages', authenticate, chatController.sendMessage);
router.post('/upload', authenticate, upload.single('chat'), chatController.uploadFile);

module.exports = router;
