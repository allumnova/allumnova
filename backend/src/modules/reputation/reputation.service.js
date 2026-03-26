const prisma = require('../../models');
const notificationService = require('../notification/notification.service');

const TIERS = [
    { name: 'Echo', minScore: 0 },
    { name: 'Pulse', minScore: 500 },
    { name: 'Resonance', minScore: 2500 },
    { name: 'Frequency', minScore: 5000 },
    { name: 'The Source', minScore: 10000 }
];

const calculateTier = (score) => {
    let currentTier = TIERS[0].name;
    for (const tier of TIERS) {
        if (score >= tier.minScore) {
            currentTier = tier.name;
        } else {
            break;
        }
    }
    return currentTier;
};

const updateReputation = async (userId, points) => {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new Error('User not found');

    const newScore = user.reputationScore + points;
    const newTier = calculateTier(newScore);

    const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: {
            reputationScore: newScore,
            tierLevel: newTier
        }
    });

    // Notify user of tier promotion
    if (newTier !== user.tierLevel) {
        await notificationService.createNotification(userId, 'tier_up', {
            message: `Congratulations! You've been promoted to ${newTier} level.`,
            targetId: userId
        });
    }

    return updatedUser;
};

module.exports = {
    updateReputation,
    calculateTier
};
