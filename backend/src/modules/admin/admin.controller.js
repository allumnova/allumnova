const adminService = require('./admin.service');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const getDashboardStats = async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ success: false, error: 'Unauthorized: Admin access required.' });
        }

        const data = await adminService.getDashboardStats();
        res.status(200).json({ success: true, data });
    } catch (error) {
        console.error('Admin Dashboard Error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
};

const getUsersList = async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ success: false, error: 'Unauthorized' });
        }

        const { search = '', page = 1, limit = 10, role } = req.query;
        const skip = (parseInt(page) - 1) * parseInt(limit);

        const whereClause = {
            AND: []
        };

        if (search) {
            whereClause.AND.push({
                OR: [
                    { name: { contains: search, mode: 'insensitive' } },
                    { email: { contains: search, mode: 'insensitive' } },
                ]
            });
        }

        if (role) {
            whereClause.AND.push({ role });
        }

        const [users, total] = await Promise.all([
            prisma.user.findMany({
                where: whereClause.AND.length > 0 ? whereClause : {},
                skip,
                take: parseInt(limit),
                orderBy: { createdAt: 'desc' },
                select: {
                    id: true,
                    name: true,
                    email: true,
                    role: true,
                    is_verified: true,
                    colleges: {
                        select: {
                            id: true,
                            status: true,
                            documentUrl: true,
                            college: { select: { name: true } }
                        }
                    },
                    createdAt: true,
                    updatedAt: true
                }
            }),
            prisma.user.count({ where: whereClause.AND.length > 0 ? whereClause : {} })
        ]);

        res.status(200).json({
            success: true,
            data: {
                users,
                pagination: {
                    total,
                    page: parseInt(page),
                    pages: Math.ceil(total / limit)
                }
            }
        });
    } catch (error) {
        console.error('Get Users Error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
};

const updateUserRole = async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ success: false, error: 'Unauthorized' });
        }

        const { targetUserId } = req.params;
        const { role } = req.body;

        if (!role || !['admin', 'user', 'college_admin'].includes(role)) {
            return res.status(400).json({ success: false, error: 'Invalid role provided' });
        }

        const updatedUser = await prisma.user.update({
            where: { id: targetUserId },
            data: { role },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
            }
        });

        res.status(200).json({ success: true, message: 'User role updated successfully', data: updatedUser });
    } catch (error) {
        console.error('Update User Role Error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
};

const getCollegesList = async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ success: false, error: 'Unauthorized' });
        }

        const { search = '', page = 1, limit = 10 } = req.query;
        const skip = (parseInt(page) - 1) * parseInt(limit);

        const whereClause = search ? {
            OR: [
                { name: { contains: search, mode: 'insensitive' } },
                { domain: { contains: search, mode: 'insensitive' } },
            ]
        } : {};

        const [colleges, total] = await Promise.all([
            prisma.college.findMany({
                where: whereClause,
                skip,
                take: parseInt(limit),
                orderBy: { name: 'asc' },
                include: {
                    _count: {
                        select: { users: true }
                    }
                }
            }),
            prisma.college.count({ where: whereClause })
        ]);

        res.status(200).json({
            success: true,
            data: {
                colleges,
                pagination: {
                    total,
                    page: parseInt(page),
                    pages: Math.ceil(total / limit)
                }
            }
        });
    } catch (error) {
        console.error('Get Colleges Error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
};

const deleteCollege = async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ success: false, error: 'Unauthorized' });
        }

        const { collegeId } = req.params;

        await prisma.college.delete({
            where: { id: collegeId }
        });

        res.status(200).json({ success: true, message: 'College deleted successfully' });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

const getAllPostsList = async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ success: false, error: 'Unauthorized' });
        }
        const { limit = 50, cursor } = req.query;
        const posts = await adminService.getAllPosts(parseInt(limit), cursor);
        res.status(200).json({ success: true, data: posts });
    } catch (error) {
        console.error('Admin Get Posts Error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
};

module.exports = {
    getDashboardStats,
    getUsersList,
    updateUserRole,
    getCollegesList,
    deleteCollege,
    getAllPostsList
};
