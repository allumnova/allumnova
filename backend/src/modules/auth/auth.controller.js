const authService = require('./auth.service');

const register = async (req, res) => {
    try {
        const user = await authService.register(req.body);
        res.status(201).json({ success: true, data: user });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
};

const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const { user, token } = await authService.login(email, password);
        res.status(200).json({ success: true, data: { user, token } });
    } catch (error) {
        res.status(401).json({ success: false, error: error.message });
    }
};

const sendOtp = async (req, res) => {
    try {
        const { email } = req.body;
        const result = await authService.sendOtp(email);
        res.status(200).json({ success: true, data: result });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
};

const verifyOtp = async (req, res) => {
    try {
        const { email, otp } = req.body;
        const { user, token } = await authService.verifyOtp(email, otp);
        res.status(200).json({ success: true, data: { user, token } });
    } catch (error) {
        res.status(401).json({ success: false, error: error.message });
    }
};

const resetPassword = async (req, res) => {
    try {
        const { email, otp, newPassword } = req.body;
        const result = await authService.resetPassword(email, otp, newPassword);
        res.status(200).json({ success: true, data: result });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
};

module.exports = {
    register,
    login,
    sendOtp,
    verifyOtp,
    resetPassword
};
