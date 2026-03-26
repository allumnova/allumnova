const express = require('express');
const router = express.Router();
const collegeController = require('./college.controller');
const { authenticate } = require('../../middlewares/auth.middleware');

router.get('/', authenticate, collegeController.listColleges);
router.get('/switch/:subdomain', authenticate, collegeController.switchCollege);
router.post('/join', authenticate, collegeController.requestJoin);
router.post('/suggest', authenticate, collegeController.suggestCollege);
router.get('/my-requests', authenticate, collegeController.listMyRequests);
router.get('/all-requests', authenticate, collegeController.listAllRequests);
router.post('/review-request', authenticate, collegeController.reviewRequest);
router.post('/respond', authenticate, collegeController.approveRequest);
router.get('/pending/:collegeId', authenticate, collegeController.listPendingRequests);

module.exports = router;
