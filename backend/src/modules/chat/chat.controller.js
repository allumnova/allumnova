const chatService = require('./chat.service');

exports.getConversations = async (req, res) => {
    try {
        const conversations = await chatService.listConversations(req.user.userId);
        res.json(conversations);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getMessages = async (req, res) => {
    try {
        const { conversationId } = req.params;
        if (!conversationId || conversationId === 'null') {
            return res.json([]);
        }
        const messages = await chatService.listMessages(conversationId, req.user.userId);
        res.json(messages);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.sendMessage = async (req, res) => {
    try {
        const { conversationId, receiverId, content, mediaUrl } = req.body;
        const message = await chatService.createMessage(req.user.userId, conversationId, receiverId, content, mediaUrl);
        res.status(201).json(message);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.uploadFile = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }
        const fileUrl = `/uploads/chat/${req.file.filename}`;
        res.json({ url: fileUrl });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
