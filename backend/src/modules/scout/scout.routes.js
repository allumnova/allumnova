const express = require('express');
const router = express.Router();
const scoutService = require('./scout.service');
const { authenticate } = require('../../middlewares/auth.middleware');

const scoutController = {
    getResearch: async (req, res) => {
        try {
            const userId = req.user.userId;
            const collegeId = req.collegeId;

            const [peers, blueprints, archetype] = await Promise.all([
                scoutService.findPeerClusters(userId, collegeId),
                scoutService.findAlumniBlueprints(userId, collegeId),
                scoutService.analyzeArchetype(userId)
            ]);

            res.json({
                success: true,
                data: {
                    peers,
                    blueprints,
                    archetype
                }
            });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }
};

router.get('/research', authenticate, scoutController.getResearch);

module.exports = router;
