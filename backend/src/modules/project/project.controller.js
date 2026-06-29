const prisma = require('../../models');

const getProjects = async (req, res) => {
    try {
        const organizationId = req.user.organizationId;
        const projects = await prisma.project.findMany({
            where: { organizationId },
            include: {
                tasks: true
            },
            orderBy: { createdAt: 'desc' }
        });
        res.json({ success: true, data: projects });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

const createProject = async (req, res) => {
    try {
        const organizationId = req.user.organizationId;
        const { name, description, status } = req.body;

        const project = await prisma.project.create({
            data: {
                organizationId,
                name,
                description,
                status: status || 'IDEA'
            }
        });
        res.status(201).json({ success: true, data: project });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
};

const getProjectById = async (req, res) => {
    try {
        const organizationId = req.user.organizationId;
        const { projectId } = req.params;

        const project = await prisma.project.findFirst({
            where: { id: projectId, organizationId },
            include: {
                tasks: true
            }
        });

        if (!project) {
            return res.status(404).json({ success: false, error: 'Project not found' });
        }

        res.json({ success: true, data: project });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

const updateProject = async (req, res) => {
    try {
        const organizationId = req.user.organizationId;
        const { projectId } = req.params;
        const { name, description, status } = req.body;

        // Verify ownership
        const existing = await prisma.project.findFirst({
            where: { id: projectId, organizationId }
        });
        if (!existing) {
            return res.status(404).json({ success: false, error: 'Project not found' });
        }

        const updated = await prisma.project.update({
            where: { id: projectId },
            data: { name, description, status }
        });

        res.json({ success: true, data: updated });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
};

const deleteProject = async (req, res) => {
    try {
        const organizationId = req.user.organizationId;
        const { projectId } = req.params;

        const existing = await prisma.project.findFirst({
            where: { id: projectId, organizationId }
        });
        if (!existing) {
            return res.status(404).json({ success: false, error: 'Project not found' });
        }

        await prisma.project.delete({
            where: { id: projectId }
        });

        res.json({ success: true, message: 'Project deleted successfully' });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// Task controllers
const createTask = async (req, res) => {
    try {
        const organizationId = req.user.organizationId;
        const { projectId } = req.params;
        const { title, description, status, dueDate, slaDeadline } = req.body;

        // Verify project ownership
        const project = await prisma.project.findFirst({
            where: { id: projectId, organizationId }
        });
        if (!project) {
            return res.status(404).json({ success: false, error: 'Project not found' });
        }

        const task = await prisma.task.create({
            data: {
                organizationId,
                projectId,
                title,
                description,
                status: status || 'TODO',
                dueDate: dueDate ? new Date(dueDate) : null,
                slaDeadline: slaDeadline ? new Date(slaDeadline) : null
            }
        });

        res.status(201).json({ success: true, data: task });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
};

const updateTask = async (req, res) => {
    try {
        const organizationId = req.user.organizationId;
        const { taskId } = req.params;
        const { title, description, status, dueDate, slaDeadline } = req.body;

        // Verify task ownership
        const existing = await prisma.task.findFirst({
            where: { id: taskId, organizationId }
        });
        if (!existing) {
            return res.status(404).json({ success: false, error: 'Task not found' });
        }

        const updated = await prisma.task.update({
            where: { id: taskId },
            data: {
                title,
                description,
                status,
                dueDate: dueDate ? new Date(dueDate) : undefined,
                slaDeadline: slaDeadline ? new Date(slaDeadline) : undefined
            }
        });

        res.json({ success: true, data: updated });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
};

const deleteTask = async (req, res) => {
    try {
        const organizationId = req.user.organizationId;
        const { taskId } = req.params;

        // Verify task ownership
        const existing = await prisma.task.findFirst({
            where: { id: taskId, organizationId }
        });
        if (!existing) {
            return res.status(404).json({ success: false, error: 'Task not found' });
        }

        await prisma.task.delete({
            where: { id: taskId }
        });

        res.json({ success: true, message: 'Task deleted successfully' });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

module.exports = {
    getProjects,
    createProject,
    getProjectById,
    updateProject,
    deleteProject,
    createTask,
    updateTask,
    deleteTask
};
