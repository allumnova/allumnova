const feedService = require('./feed.service');

const getFeed = async (req, res) => {
    try {
        const { limit, cursor, type, hubId } = req.query;
        const posts = await feedService.getPersonalizedFeed(
            req.user.collegeId,
            req.user.userId,
            limit ? parseInt(limit) : 20,
            cursor,
            type,
            hubId
        );
        res.json(posts);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const postContent = async (req, res) => {
    try {
        const post = await feedService.createPost(req.user.userId, req.collegeId, req.body);
        res.status(201).json({ success: true, data: post });
    } catch (error) {
        console.error(`ERROR: postContent failed - ${error.message}`);
        const statusCode = error.message.includes('limit reached') ? 429 : 403;
        res.status(statusCode).json({ success: false, error: error.message });
    }
};

const engagementAction = async (req, res) => {
    try {
        const { postId, type, content } = req.body;
        const interaction = await feedService.interact(req.user.userId, postId, type, content);
        res.status(200).json({ success: true, data: interaction });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

const updatePostContent = async (req, res) => {
    try {
        const { id } = req.params;
        const post = await feedService.updatePost(req.user.userId, id, req.body);
        res.status(200).json({ success: true, data: post });
    } catch (error) {
        res.status(403).json({ success: false, error: error.message });
    }
};

const deletePostPermanently = async (req, res) => {
    try {
        const { id } = req.params;
        await feedService.deletePost(req.user.userId, id);
        res.status(200).json({ success: true, message: 'Post deleted' });
    } catch (error) {
        res.status(403).json({ success: false, error: error.message });
    }
};

const reportPostContent = async (req, res) => {
    try {
        const { postId, reason } = req.body;
        const report = await feedService.reportPost(req.user.userId, postId, reason);
        res.status(201).json({ success: true, data: report });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

module.exports = {
    getFeed,
    postContent,
    engagementAction,
    updatePostContent,
    deletePostPermanently,
    reportPostContent
};
