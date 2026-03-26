const prisma = require('../../models');
const reputationService = require('./reputation.service');

exports.getMyReputation = async (req, res) => {
    try {
        const userId = req.user.userId;
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { reputationScore: true, tierLevel: true }
        });
        res.json(user);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getTiers = (req, res) => {
    res.json([
        { name: 'Echo', minScore: 0 },
        { name: 'Pulse', minScore: 500 },
        { name: 'Resonance', minScore: 2500 },
        { name: 'Frequency', minScore: 5000 },
        { name: 'The Source', minScore: 10000 }
    ]);
};
