const express = require('express');
const router = express.Router();
const adminController = require('./admin.controller');
const { authenticate } = require('../../middlewares/auth.middleware');

// GET /api/admin/dashboard
router.get('/dashboard', authenticate, adminController.getDashboardStats);

// Users Management
router.get('/users', authenticate, adminController.getUsersList);
router.patch('/users/:targetUserId/role', authenticate, adminController.updateUserRole);

// Colleges Management
router.get('/colleges', authenticate, adminController.getCollegesList);
router.delete('/colleges/:collegeId', authenticate, adminController.deleteCollege);

module.exports = router;
