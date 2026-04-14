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

const getPortfolioByUsername = async (req, res) => {
    try {
        const { username } = req.params;
        console.log(`--- Portfolio Lookup Request: ${username} ---`);
        const profile = await profileService.getPortfolioByUsername(username);
        console.log(`--- Portfolio Found for: ${username} (User ID: ${profile.id}) ---`);
        res.status(200).json({ success: true, data: profile });
    } catch (error) {
        console.error(`--- Portfolio NOT Found for: ${req.params.username} Error: ${error.message} ---`);
        res.status(404).json({ success: false, error: 'Portfolio not found' });
    }
};

const updateMyProfile = async (req, res) => {
    try {
        const { 
            name, bio, linkedIn, department, role, username, 
            careerObjective, techSkills, achievements, hobbies, isPublic 
        } = req.body;

        // Sanitize username: empty string or whitespace should be null to avoid unique constraint issues
        const sanitizedUsername = (username && username.trim() !== '') ? username.trim().toLowerCase() : null;

        const updateData = {
            name,
            bio,
            linkedIn,
            department,
            role,
            username: sanitizedUsername,
            careerObjective,
            isPublic: isPublic === 'true' || isPublic === true
        };

        // Safely parse JSON strings from FormData
        try {
            if (techSkills) updateData.techSkills = JSON.parse(techSkills);
            if (achievements) updateData.achievements = JSON.parse(achievements);
            if (hobbies) updateData.hobbies = JSON.parse(hobbies);
        } catch (parseError) {
            console.error('Error parsing profile JSON fields:', parseError);
        }

        if (req.files) {
            if (req.files.avatar) {
                updateData.avatar = `/uploads/avatars/${req.files.avatar[0].filename}`;
            }
            if (req.files.resume) {
                updateData.resumeUrl = `/uploads/resumes/${req.files.resume[0].filename}`;
            }
        }

        console.log('--- VPS Profile Update Request ---');
        console.log('User ID:', req.user.userId);
        console.log('Sanitized Update Data:', JSON.stringify(updateData, null, 2));

        const profile = await profileService.updateProfile(req.user.userId, updateData);
        res.status(200).json({ success: true, data: profile });
    } catch (error) {
        console.error('CRITICAL Profile Update Error:', error);
        res.status(500).json({ 
            success: false, 
            error: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined 
        });
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
        console.log(`[Admin] Fetching pending user verifications...`);
        const requests = await profileService.listPendingVerifications();
        console.log(`[Admin] Retrieved ${requests.length} user verifications.`);
        res.status(200).json({ success: true, data: requests });
    } catch (error) {
        console.error('List Verifications Error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
};

const verifyUser = async (req, res) => {
    try {
        const { mappingId, status } = req.body;
        console.log(`[Admin] Verifying user (Mapping: ${mappingId}) to Status: ${status}`);
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

// --- Career Section Handlers ---

const addExperience = async (req, res) => {
    try {
        const result = await profileService.addExperience(req.user.userId, req.body);
        res.status(201).json({ success: true, data: result });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

const deleteExperience = async (req, res) => {
    try {
        const result = await profileService.deleteExperience(req.user.userId, req.params.id);
        res.status(200).json({ success: true, data: result });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

const addEducation = async (req, res) => {
    try {
        const result = await profileService.addEducation(req.user.userId, req.body);
        res.status(201).json({ success: true, data: result });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

const deleteEducation = async (req, res) => {
    try {
        const result = await profileService.deleteEducation(req.user.userId, req.params.id);
        res.status(200).json({ success: true, data: result });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

const addCertification = async (req, res) => {
    try {
        const result = await profileService.addCertification(req.user.userId, req.body);
        res.status(201).json({ success: true, data: result });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

const deleteCertification = async (req, res) => {
    try {
        const result = await profileService.deleteCertification(req.user.userId, req.params.id);
        res.status(200).json({ success: true, data: result });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

const checkUsernameAvailability = async (req, res) => {
    try {
        const { username } = req.query;
        if (!username) return res.status(400).json({ success: false, error: 'Username is required' });
        const result = await profileService.checkUsernameAvailability(username);
        res.status(200).json({ success: true, data: result });
    } catch (error) {
        console.error('Check Username Error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
};

module.exports = {
    getMyProfile,
    getPublicProfile,
    updateMyProfile,
    getPortfolioByUsername,
    completeOnboarding,
    getPendingVerifications,
    verifyUser,
    updatePulse,
    addExperience,
    deleteExperience,
    addEducation,
    deleteEducation,
    addCertification,
    deleteCertification,
    checkUsernameAvailability
};
