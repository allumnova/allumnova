const prisma = require('../../models');
const { Queue } = require('bullmq');

let taskQueue;
try {
    const redisUrl = new URL(process.env.REDIS_URL || 'redis://localhost:6379');
    taskQueue = new Queue('allumnova-queue', {
        connection: {
            host: redisUrl.hostname || 'localhost',
            port: parseInt(redisUrl.port) || 6379
        }
    });
} catch (e) {
    console.warn('BullMQ Queue connection failed (Redis offline):', e.message);
}

const getWorkflows = async (organizationId) => {
    return prisma.workflow.findMany({
        where: { organizationId, isActive: true }
    });
};

const getWorkflowRuns = async (workflowId) => {
    return prisma.workflowRun.findMany({
        where: { workflowId },
        orderBy: { startedAt: 'desc' }
    });
};

const createRun = async (workflowId, initialContext = {}) => {
    const workflow = await prisma.workflow.findUnique({
        where: { id: workflowId }
    });
    if (!workflow) throw new Error('Workflow not found');

    const config = workflow.definition;
    const initialState = config.initialState || 'DRAFT';

    const run = await prisma.workflowRun.create({
        data: {
            workflowId,
            currentState: initialState,
            contextData: initialContext,
            status: 'RUNNING'
        }
    });

    // Write audit log
    await prisma.auditLog.create({
        data: {
            organizationId: workflow.organizationId,
            action: 'WORKFLOW_RUN_START',
            tableName: 'WorkflowRun',
            recordId: run.id,
            newValues: { state: initialState }
        }
    });

    return run;
};

const executeTransition = async (runId, eventName, triggerUser = {}) => {
    const run = await prisma.workflowRun.findUnique({
        where: { id: runId },
        include: { workflow: true }
    });
    if (!run) throw new Error('Workflow run not found');
    if (run.status !== 'RUNNING') throw new Error('Workflow run is already completed or failed');

    const workflow = run.workflow;
    const config = workflow.definition;
    const currentStateConfig = config.states?.[run.currentState];

    if (!currentStateConfig) {
        throw new Error(`Current state ${run.currentState} not defined in workflow schema`);
    }

    const transition = currentStateConfig.on?.[eventName];
    if (!transition) {
        throw new Error(`Transition event "${eventName}" not allowed from state ${run.currentState}`);
    }

    const targetState = transition.target;
    if (!targetState) {
        throw new Error(`Transition target is undefined for event "${eventName}"`);
    }

    // 1. Validate Conditions
    if (transition.conditions) {
        for (const condition of transition.conditions) {
            if (condition === 'checkAmountLimit' && run.contextData?.amount > 50000) {
                throw new Error('Approval limit exceeded. Transition blocked.');
            }
            if (condition === 'checkUserIsApprover' && triggerUser.role !== 'ADMIN' && triggerUser.role !== 'MANAGER') {
                throw new Error('Unauthorized: Approver role required.');
            }
        }
    }

    // 2. Perform Transitions
    const status = config.states[targetState]?.type === 'final' ? 'COMPLETED' : 'RUNNING';
    const completedAt = status === 'COMPLETED' ? new Date() : null;

    const updatedRun = await prisma.workflowRun.update({
        where: { id: runId },
        data: {
            currentState: targetState,
            status,
            completedAt
        }
    });

    // 3. Trigger Actions
    if (transition.actions) {
        for (const action of transition.actions) {
            // Push job to BullMQ background queue
            if (taskQueue) {
                await taskQueue.add(action, {
                    runId,
                    targetState,
                    triggerUser
                });
            }
            console.log(`[Workflow Engine] Queue action triggered: ${action}`);
        }
    }

    // 4. Log Audit
    await prisma.auditLog.create({
        data: {
            organizationId: workflow.organizationId,
            userId: triggerUser.id,
            action: 'WORKFLOW_TRANSITION',
            tableName: 'WorkflowRun',
            recordId: runId,
            oldValues: { state: run.currentState },
            newValues: { state: targetState, eventName }
        }
    });

    return updatedRun;
};

module.exports = {
    getWorkflows,
    getWorkflowRuns,
    createRun,
    executeTransition
};
