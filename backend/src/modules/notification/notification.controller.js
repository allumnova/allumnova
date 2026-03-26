const notificationService = require('./notification.service');

const getMyNotifications = async (req, res) => {
    try {
        const notifications = await notificationService.getUserNotifications(req.user.userId);
        res.status(200).json({ success: true, data: notifications });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

const markRead = async (req, res) => {
    try {
        const { id } = req.params;
        await notificationService.markAsRead(id, req.user.userId);
        res.status(200).json({ success: true });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

const markAllRead = async (req, res) => {
    try {
        await notificationService.markAllAsRead(req.user.userId);
        res.status(200).json({ success: true });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

module.exports = {
    getMyNotifications,
    markRead,
    markAllRead
};
