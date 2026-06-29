const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
    console.log('🧹 CLEAN SWEEP: Clearing existing database tables...');

    try {
        await prisma.payment.deleteMany({});
        await prisma.invoice.deleteMany({});
        await prisma.workflowRun.deleteMany({});
        await prisma.workflow.deleteMany({});
        await prisma.task.deleteMany({});
        await prisma.project.deleteMany({});
        await prisma.session.deleteMany({});
        await prisma.auditLog.deleteMany({});
        await prisma.aiTokenMetric.deleteMany({});
        try {
            await prisma.aiKnowledgeBase.deleteMany({});
        } catch (e) {
            console.log('pgvector clear skipped: no extension or table content');
        }
        await prisma.subscriptionLog.deleteMany({});
        await prisma.user.deleteMany({});
        await prisma.organization.deleteMany({});
        await prisma.aiPrompt.deleteMany({});
    } catch (error) {
        console.warn('Clear tables warning:', error.message);
    }

    console.log('✅ Tables cleared.');

    // 1. Create Organization
    const org = await prisma.organization.create({
        data: {
            id: 'org_allumnova',
            name: 'Allumnova Enterprise OS',
            domain: 'allumnova.in',
            subscriptionPlan: 'ENTERPRISE',
            status: 'ACTIVE'
        }
    });
    console.log(`🏢 Created Organization: ${org.name}`);

    // 2. Create Users
    const adminPasswordHash = await bcrypt.hash('mnbvcxz', 10);
    const clientPasswordHash = await bcrypt.hash('password', 10);

    const adminUser = await prisma.user.create({
        data: {
            id: 'usr_vipranshu',
            organizationId: org.id,
            email: 'vipranshusachan@gmail.com',
            password_hash: adminPasswordHash,
            name: 'Vipranshu Sachan',
            role: 'ADMIN',
            isActive: true
        }
    });
    console.log(`👤 Admin User created: ${adminUser.email}`);

    const clientUser = await prisma.user.create({
        data: {
            id: 'usr_client',
            organizationId: org.id,
            email: 'client@example.com',
            password_hash: clientPasswordHash,
            name: 'Acme Corporates Client',
            role: 'CLIENT',
            isActive: true
        }
    });
    console.log(`👤 Client User created: ${clientUser.email}`);

    // 3. Create Sample Projects
    const projectSolar = await prisma.project.create({
        data: {
            id: 'proj_solar',
            organizationId: org.id,
            name: 'Project Solar Monitor',
            description: 'IoT solar panel metrics dashboard and anomaly alert engine.',
            status: 'BUILDING'
        }
    });
    const projectNexus = await prisma.project.create({
        data: {
            id: 'proj_nexus',
            organizationId: org.id,
            name: 'Project Nexus AI',
            description: 'Autonomous requirements elicitation and document signature workflows.',
            status: 'IDEA'
        }
    });
    console.log('📁 Sample projects created.');

    // 4. Create Sample Tasks
    const now = new Date();
    
    // SLA deadline in 2 hours (urgent warning)
    const urgentSla = new Date(now.getTime() + 2 * 60 * 60 * 1000);
    // SLA deadline in 24 hours (safe)
    const safeSla = new Date(now.getTime() + 24 * 60 * 60 * 1000);

    await prisma.task.createMany({
        data: [
            {
                id: 'task_1',
                organizationId: org.id,
                projectId: projectSolar.id,
                title: 'Set up Express API controllers & routing tables',
                description: 'Migrate old routes to support B2B modules.',
                status: 'DONE',
                dueDate: new Date(now.getTime() - 24 * 60 * 60 * 1000)
            },
            {
                id: 'task_2',
                organizationId: org.id,
                projectId: projectSolar.id,
                title: 'Configure Logical Multi-tenant DB Indexes',
                description: 'Add composite index for organizationId scope checking.',
                status: 'IN_PROGRESS',
                slaDeadline: urgentSla,
                dueDate: urgentSla
            },
            {
                id: 'task_3',
                organizationId: org.id,
                projectId: projectSolar.id,
                title: 'Integrate Redis Sorted Sets SLA Tracker',
                description: 'Implement BullMQ cron to check SLA breaches dynamically.',
                status: 'TODO',
                slaDeadline: safeSla,
                dueDate: safeSla
            },
            {
                id: 'task_4',
                organizationId: org.id,
                projectId: projectNexus.id,
                title: 'Deploy LangGraph ReAct agent pipeline',
                description: 'Enable business scoping conversation and feedback audit logs.',
                status: 'TODO',
                dueDate: new Date(now.getTime() + 72 * 60 * 60 * 1000)
            }
        ]
    });
    console.log('📝 Sample tasks created.');

    // 5. Create Workflows
    const sampleWorkflowDef = {
        workflowId: 'wf_proposal_sign_v1',
        initialState: 'DRAFT',
        states: {
            DRAFT: {
                on: {
                    SUBMIT_FOR_APPROVAL: {
                        target: 'PENDING_APPROVAL',
                        actions: ['notifyApproverGroup', 'logAuditAction']
                    }
                }
            },
            PENDING_APPROVAL: {
                on: {
                    APPROVE: {
                        target: 'APPROVED',
                        actions: ['generateCryptographicPdfSign', 'notifyClient']
                    },
                    REJECT: {
                        target: 'REJECTED',
                        actions: ['notifyCreatorOfRejection']
                    }
                }
            },
            APPROVED: {
                type: 'final'
            },
            REJECTED: {
                on: {
                    EDIT: {
                        target: 'DRAFT'
                    }
                }
            }
        }
    };

    const wf = await prisma.workflow.create({
        data: {
            id: 'wf_proposal',
            organizationId: org.id,
            name: 'Proposal Agreement Workflow',
            description: 'Automated state machine for contract signing and audit verification.',
            triggerType: 'EVENT',
            definition: sampleWorkflowDef,
            isActive: true
        }
    });
    console.log(`⚙️ Workflows created: ${wf.name}`);

    // 6. Create Prompts
    await prisma.aiPrompt.createMany({
        data: [
            {
                id: 'prompt_req_extractor',
                name: 'REQUIREMENTS_EXTRACTOR',
                template: 'Analyze client feedback: {{requirements}}. Extract structured JSON tasks including "title", "description", and "priority".',
                version: 1
            },
            {
                id: 'prompt_pm_agent',
                name: 'PM_AGENT',
                template: 'You are an autonomous PM Agent. Analyze task logs: {{tasks}} and respond to queries.',
                version: 1
            }
        ]
    });
    console.log('🤖 AI prompt templates created.');

    // 7. Create Invoices and Payments
    const invoice1 = await prisma.invoice.create({
        data: {
            id: 'inv_1',
            organizationId: org.id,
            clientId: clientUser.id,
            amount: 4500.00,
            currency: 'USD',
            status: 'UNPAID',
            dueDate: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)
        }
    });

    const invoice2 = await prisma.invoice.create({
        data: {
            id: 'inv_2',
            organizationId: org.id,
            clientId: clientUser.id,
            amount: 12500.00,
            currency: 'USD',
            status: 'PAID',
            dueDate: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000)
        }
    });

    await prisma.payment.create({
        data: {
            id: 'pay_1',
            invoiceId: invoice2.id,
            paymentGateway: 'STRIPE',
            transactionReference: 'ch_stripe_8236487236',
            amount: 12500.00,
            status: 'SUCCESS'
        }
    });
    console.log('💳 Sample invoices and payments created.');

    // 8. Create AI metrics telemetry data
    await prisma.aiTokenMetric.createMany({
        data: [
            {
                organizationId: org.id,
                agentId: 'PM_AGENT',
                promptTokens: 850,
                completionTokens: 340,
                estimatedCostUsd: 0.00595
            },
            {
                organizationId: org.id,
                agentId: 'SALES_AGENT',
                promptTokens: 1200,
                completionTokens: 900,
                estimatedCostUsd: 0.01500
            },
            {
                organizationId: org.id,
                agentId: 'BUSINESS_CONSULTANT',
                promptTokens: 2500,
                completionTokens: 1800,
                estimatedCostUsd: 0.03450
            }
        ]
    });
    console.log('📊 Telemetry data initialized.');

    console.log('\n🎉 B2B ENTERPRISE OS IS SEEDED AND READY!');
    console.log('   Admin Login: vipranshusachan@gmail.com / mnbvcxz');
    console.log('   Client Login: client@example.com / password');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
