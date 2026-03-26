const profileService = require('./profile.service');

const getMyProfile = async (req, res) => {
    try {
        const profile = await profileService.getProfile(req.user.userId);
        res.status(200).json({ success: true, data: profile });
    } catch (error) {
        console.error('Get Profile Error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
};

const getPublicProfile = async (req, res) => {
    try {
        const { userId } = req.params;
        const profile = await profileService.getUserProfile(userId, req.user.userId);
        res.status(200).json({ success: true, data: profile });
    } catch (error) {
        console.error('Get Public Profile Error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
};

const updateMyProfile = async (req, res) => {
    try {
        const profile = await profileService.updateProfile(req.user.userId, req.body);
        res.status(200).json({ success: true, data: profile });
    } catch (error) {
        console.error('Update Profile Error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
};

const completeOnboarding = async (req, res) => {
    try {
        const onboardingData = { ...req.body };
        if (req.file) {
            // Store the relative path which can be used to construct the full URL later
            onboardingData.documentUrl = `/uploads/documents/${req.file.filename}`;
        }
        console.log('Completing onboarding for user:', req.user.userId, 'Data:', onboardingData);
        const user = await profileService.completeOnboarding(req.user.userId, onboardingData);
        res.status(200).json({ success: true, data: user });
    } catch (error) {
        console.error('Onboarding Error Details:', error);
        res.status(500).json({ success: false, error: error.message });
    }
};

const getPendingVerifications = async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ success: false, error: 'Unauthorized' });
        }
        const requests = await profileService.listPendingVerifications();
        res.status(200).json({ success: true, data: requests });
    } catch (error) {
        console.error('List Verifications Error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
};

const verifyUser = async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ success: false, error: 'Unauthorized' });
        }
        const { mappingId, status } = req.body;
        const result = await profileService.verifyUser(mappingId, status);
        res.status(200).json({ success: true, data: result });
    } catch (error) {
        console.error('Verify User Error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
};

const updatePulse = async (req, res) => {
    try {
        const { pulse, pulseEmoji } = req.body;
        const user = await profileService.updatePulse(req.user.userId, { pulse, pulseEmoji });
        
        // Broadcast pulse change to the college(s) if applicable
        const socketUtil = require('../../utils/socket');
        if (user.colleges && user.colleges.length > 0) {
            user.colleges.forEach(membership => {
                socketUtil.sendToCollege(membership.collegeId, 'pulse_update', {
                    userId: user.id,
                    name: user.name,
                    pulse: user.pulse,
                    pulseEmoji: user.pulseEmoji
                });
            });
        }

        res.status(200).json({ success: true, data: user });
    } catch (error) {
        console.error('Update Pulse Error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
};

module.exports = {
    getMyProfile,
    getPublicProfile,
    updateMyProfile,
    completeOnboarding,
    getPendingVerifications,
    verifyUser,
    updatePulse
};
