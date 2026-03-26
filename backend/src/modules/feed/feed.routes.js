const express = require('express');
const router = express.Router();
const feedController = require('./feed.controller');
const { authenticate, checkCollegeAccess, checkVerified } = require('../../middlewares/auth.middleware');

router.get('/', authenticate, checkCollegeAccess, feedController.getFeed);
router.post('/post', authenticate, checkCollegeAccess, checkVerified, feedController.postContent);
router.post('/interact', authenticate, checkCollegeAccess, checkVerified, feedController.engagementAction);
router.patch('/post/:id', authenticate, checkCollegeAccess, checkVerified, feedController.updatePostContent);
router.delete('/post/:id', authenticate, checkCollegeAccess, checkVerified, feedController.deletePostPermanently);
router.post('/report', authenticate, checkCollegeAccess, checkVerified, feedController.reportPostContent);

module.exports = router;
