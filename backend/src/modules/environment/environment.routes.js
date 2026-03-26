const express = require('express');
const router = express.Router();
const environmentController = require('./environment.controller');
const { authenticate } = require('../../middlewares/auth.middleware');

router.get('/', authenticate, environmentController.getEnvironments);
router.post('/join', authenticate, environmentController.joinEnvironment);

module.exports = router;
