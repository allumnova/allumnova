const express = require('express');
const router = express.Router();
const prisma = require('../../models');
const { authenticate } = require('../../middlewares/auth.middleware');

// Get CRM sales pipeline (projects categorized by status)
router.get('/pipeline', authenticate, async (req, res) => {
    try {
        const organizationId = req.user.organizationId;
        const projects = await prisma.project.findMany({
            where: { organizationId },
            orderBy: { updatedAt: 'desc' }
        });

        // Group into pipelines
        const pipeline = {
            LEAD: projects.filter(p => p.status === 'IDEA'),
            PROPOSAL_SENT: projects.filter(p => p.status === 'BUILDING'),
            NEGOTIATION: projects.filter(p => p.status === 'MVP'),
            CLOSED_WON: projects.filter(p => p.status === 'SCALING')
        };

        res.json({ success: true, data: pipeline });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Update pipeline stage
router.patch('/pipeline/:projectId', authenticate, async (req, res) => {
    try {
        const organizationId = req.user.organizationId;
        const { projectId } = req.params;
        const { stage } = req.body; // IDEA, BUILDING, MVP, SCALING

        const existing = await prisma.project.findFirst({
            where: { id: projectId, organizationId }
        });

        if (!existing) {
            return res.status(404).json({ success: false, error: 'Deal not found' });
        }

        const updated = await prisma.project.update({
            where: { id: projectId },
            data: { status: stage }
        });

        res.json({ success: true, data: updated });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
});

module.exports = router;
