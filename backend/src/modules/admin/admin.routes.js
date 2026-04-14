const express = require('express');
const router = express.Router();
const adminController = require('./admin.controller');
const { authenticate, isAdmin } = require('../../middlewares/auth.middleware');

// GET /api/admin/dashboard
router.get('/dashboard', authenticate, isAdmin, adminController.getDashboardStats);
router.get('/users', authenticate, isAdmin, adminController.getUsersList);
router.patch('/users/:targetUserId/role', authenticate, isAdmin, adminController.updateUserRole);
router.get('/colleges', authenticate, isAdmin, adminController.getCollegesList);
router.delete('/colleges/:collegeId', authenticate, isAdmin, adminController.deleteCollege);
router.get('/posts', authenticate, isAdmin, adminController.getAllPostsList);

module.exports = router;
