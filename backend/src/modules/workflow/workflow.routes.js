const express = require('express');
const router = express.Router();
const workflowService = require('./workflow.service');
const { authenticate } = require('../../middlewares/auth.middleware');

router.get('/', authenticate, async (req, res) => {
    try {
        const organizationId = req.user.organizationId;
        const list = await workflowService.getWorkflows(organizationId);
        res.json({ success: true, data: list });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

router.get('/:workflowId/runs', authenticate, async (req, res) => {
    try {
        const { workflowId } = req.params;
        const runs = await workflowService.getWorkflowRuns(workflowId);
        res.json({ success: true, data: runs });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

router.post('/:workflowId/runs', authenticate, async (req, res) => {
    try {
        const { workflowId } = req.params;
        const { contextData } = req.body;
        const run = await workflowService.createRun(workflowId, contextData);
        res.status(201).json({ success: true, data: run });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
});

router.post('/runs/:runId/transition', authenticate, async (req, res) => {
    try {
        const { runId } = req.params;
        const { eventName } = req.body;
        const user = req.user;

        const updatedRun = await workflowService.executeTransition(runId, eventName, user);
        res.json({ success: true, data: updatedRun });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
});

module.exports = router;
