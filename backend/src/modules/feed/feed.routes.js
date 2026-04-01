const express = require('express');
const router = express.Router();
const feedController = require('./feed.controller');
const { authenticate, checkVerified, checkCollegeAccess } = require('../../middlewares/auth.middleware');
const upload = require('../../utils/upload');

router.get('/', authenticateOptional, checkCollegeAccess, feedController.getFeed);
router.post('/post', authenticate, checkCollegeAccess, checkVerified, (req, res, next) => {
    // Manually handle fields before multer if needed, but usually we just let multer handle it
    next();
}, upload.array('post_media', 5), feedController.postContent);
router.post('/interact', authenticate, checkCollegeAccess, checkVerified, feedController.engagementAction);
router.patch('/post/:id', authenticate, checkCollegeAccess, checkVerified, feedController.updatePostContent);
router.delete('/post/:id', authenticate, checkCollegeAccess, checkVerified, feedController.deletePostPermanently);
router.post('/report', authenticate, checkCollegeAccess, checkVerified, feedController.reportPostContent);

module.exports = router;
