const prisma = require('../../models');

// Quick simulated LLM utility
const simulateLLM = async (promptName, variables, systemPrompt) => {
    // Generate realistic response based on inputs
    if (promptName === 'REQUIREMENTS_EXTRACTOR') {
        const text = variables.requirements || '';
        const title = text.split('\n')[0] || 'New Enterprise Solution';
        
        return JSON.stringify({
            projectName: title,
            description: `Auto-scoped plan for: ${text}`,
            milestones: [
                {
                    title: "Phase 1: Architecture & Foundation",
                    tasks: [
                        { title: "Define multi-tenant logical schemas", description: "Establish database models scoped by organizationId.", priority: "HIGH" },
                        { title: "Configure BullMQ background task workers", description: "Initialize Redis connection and task processing threads.", priority: "MEDIUM" }
                    ]
                },
                {
                    title: "Phase 2: Core Workflows & Portal",
                    tasks: [
                        { title: "Implement JSON state transition router", description: "Connect actions trigger webhook callbacks.", priority: "HIGH" },
                        { title: "Build glassmorphic workspace dashboard", description: "Animate cards, status indicators, and SLA telemetry.", priority: "MEDIUM" }
                    ]
                }
            ]
        }, null, 2);
    }

    if (promptName === 'PM_AGENT') {
        return `### PM Agent Recommendation
Based on the current project telemetry:
1. **Configure Logical Multi-tenant DB Indexes** has an active SLA deadline in less than 2 hours. This is critical.
2. I recommend re-assigning resources to complete this task and prevent an SLA breach.
3. The background BullMQ worker is running and ready to process state approval actions.`;
    }

    if (promptName === 'PROPOSAL_GENERATOR') {
        return `# Enterprise Services Proposal
**Prepared For:** Acme Corporates Client
**Prepared By:** Allumnova Enterprise OS Consultant
**Date:** June 2026

## 1. Executive Summary
This proposal outlines the engineering requirements for consolidating 8 distinct SaaS platforms into a unified Modular Monolith.

## 2. Project Scope & Deliverables
- **Client Workspace**: Analytics Dashboard, Requirements Engine, Document Signature.
- **Workflow Automation Engine**: Automating tasks state transitions with active SLA monitoring.
- **PgVector Knowledge Base**: Semantic search and LLM context extraction.

## 3. Financial Plan & Invoices
- **Total Project Cost**: $17,000 USD
- **Initial Invoice (Unpaid)**: $4,500 USD (Net 7 billing terms)
- **Deployment Invoice (Paid)**: $12,500 USD (Stripe Reference: ch_stripe_8236487236)

## 4. SLA & Maintenance Terms
All critical system errors must be resolved within 2 hours of telemetry reporting.`;
    }

    return "AI Consultant: I'm ready to analyze your workflows. Please specify a standard request.";
};

const chat = async (req, res) => {
    try {
        const { message, agentId } = req.body;
        const organizationId = req.user?.organizationId || 'org_allumnova';

        // 1. Log prompt metrics
        const promptTokens = 120 + Math.floor(Math.random() * 50);
        const completionTokens = 250 + Math.floor(Math.random() * 100);
        const estimatedCost = (promptTokens * 0.000005) + (completionTokens * 0.000015);

        await prisma.aiTokenMetric.create({
            data: {
                organizationId,
                agentId: agentId || 'BUSINESS_CONSULTANT',
                promptTokens,
                completionTokens,
                estimatedCostUsd: estimatedCost
            }
        });

        // 2. Fetch/Simulate reply
        const variables = { message: message?.content };
        const reply = await simulateLLM('PM_AGENT', variables);

        res.json({
            success: true,
            data: {
                role: 'assistant',
                content: reply
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

const extractRequirements = async (req, res) => {
    try {
        const { requirements } = req.body;
        const organizationId = req.user?.organizationId || 'org_allumnova';

        const promptTokens = 350;
        const completionTokens = 420;
        const estimatedCost = (promptTokens * 0.000005) + (completionTokens * 0.000015);

        await prisma.aiTokenMetric.create({
            data: {
                organizationId,
                agentId: 'BUSINESS_ARCHITECT',
                promptTokens,
                completionTokens,
                estimatedCostUsd: estimatedCost
            }
        });

        const reply = await simulateLLM('REQUIREMENTS_EXTRACTOR', { requirements });
        const parsed = JSON.parse(reply);

        res.json({
            success: true,
            data: parsed
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

const generateProposal = async (req, res) => {
    try {
        const { projectId } = req.body;
        const organizationId = req.user?.organizationId || 'org_allumnova';

        const promptTokens = 600;
        const completionTokens = 850;
        const estimatedCost = (promptTokens * 0.000005) + (completionTokens * 0.000015);

        await prisma.aiTokenMetric.create({
            data: {
                organizationId,
                agentId: 'SALES_AGENT',
                promptTokens,
                completionTokens,
                estimatedCostUsd: estimatedCost
            }
        });

        const reply = await simulateLLM('PROPOSAL_GENERATOR', { projectId });

        res.json({
            success: true,
            data: {
                proposalContent: reply,
                amount: 17000.00
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

const getMetrics = async (req, res) => {
    try {
        const organizationId = req.user?.organizationId || 'org_allumnova';

        const metrics = await prisma.aiTokenMetric.findMany({
            where: { organizationId },
            orderBy: { createdAt: 'desc' },
            take: 20
        });

        res.json({ success: true, data: metrics });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

module.exports = {
    chat,
    extractRequirements,
    generateProposal,
    getMetrics
};
