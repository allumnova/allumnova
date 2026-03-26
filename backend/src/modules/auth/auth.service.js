const prisma = require('../../models');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { createClient } = require('redis');
const { sendOTP } = require('../../utils/email.service');

const redisClient = createClient({ url: process.env.REDIS_URL });
redisClient.on('error', (err) => console.log('Auth Redis Client Error', err));

// Connect to Redis (non-blocking for module load)
(async () => {
    try {
        await redisClient.connect();
    } catch (err) {
        console.error('Failed to connect to Redis from Auth Service', err);
    }
})();

const register = async (userData) => {
    const { email, password, name } = userData;

    // Check if user already exists in DB
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
        throw new Error('User already exists');
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Cache registration metadata in Redis (15 mins)
    await redisClient.setEx(`signup:metadata:${email}`, 900, JSON.stringify({
        email,
        password: hashedPassword,
        name
    }));

    // Store OTP in Redis (5 mins)
    await redisClient.setEx(`otp:${email}`, 300, otp);

    // Send OTP via email
    await sendOTP(email, otp);

    return { message: 'OTP sent to your email. Please verify to complete registration.' };
};

const login = async (email, password) => {
    const user = await prisma.user.findUnique({
        where: { email },
        include: {
            colleges: {
                include: {
                    college: true
                }
            }
        }
    });

    if (!user || !(await bcrypt.compare(password, user.password_hash))) {
        throw new Error('Invalid credentials');
    }

    const token = jwt.sign(
        {
            userId: user.id,
            colleges: user.colleges
                .filter(c => c.status === 'VERIFIED')
                .map(c => ({
                    id: c.collegeId,
                    role: c.role
                }))
        },
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
    );

    return { user, token };
};

const sendOtp = async (email) => {
    // This is now used for re-sending OTP or for forgot password
    // Verify user exists for forgot password scenario, but allow for registration re-send
    const user = await prisma.user.findUnique({ where: { email } });
    const signupData = await redisClient.get(`signup:metadata:${email}`);

    if (!user && !signupData) {
        throw new Error('Email not recognized. Please sign up first.');
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Store OTP in Redis with 5 minutes expiration
    await redisClient.setEx(`otp:${email}`, 300, otp);

    // Send OTP via email
    await sendOTP(email, otp);

    return { message: 'OTP sent successfully' };
};

const verifyOtp = async (email, otp) => {
    const storedOtp = await redisClient.get(`otp:${email}`);

    if (!storedOtp || storedOtp !== otp) {
        throw new Error('Invalid or expired OTP');
    }

    // Check if there is pending registration data
    const registrationData = await redisClient.get(`signup:metadata:${email}`);
    let user;

    if (registrationData) {
        const { email: regEmail, password, name } = JSON.parse(registrationData);
        // Create the user account
        user = await prisma.user.create({
            data: {
                email: regEmail,
                password_hash: password,
                name,
            },
            include: {
                colleges: {
                    include: {
                        college: true
                    }
                }
            }
        });
        // Cleanup registration metadata
        await redisClient.del(`signup:metadata:${email}`);
    } else {
        // Just verify for an existing user (e.g. forgot password verification stage)
        user = await prisma.user.findUnique({
            where: { email },
            include: {
                colleges: {
                    include: {
                        college: true
                    }
                }
            }
        });
    }

    if (!user) {
        throw new Error('User not found');
    }

    // Delete OTP from Redis
    await redisClient.del(`otp:${email}`);

    const token = jwt.sign(
        {
            userId: user.id,
            colleges: user.colleges
                .filter(c => c.status === 'VERIFIED')
                .map(c => ({
                    id: c.collegeId,
                    role: c.role
                }))
        },
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
    );

    return { user, token };
};

const resetPassword = async (email, otp, newPassword) => {
    const storedOtp = await redisClient.get(`otp:${email}`);
    if (!storedOtp || storedOtp !== otp) {
        throw new Error('Invalid or expired OTP');
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
        throw new Error('User not found');
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
        where: { email },
        data: { password_hash: hashedPassword }
    });

    await redisClient.del(`otp:${email}`);

    return { message: 'Password reset successfully' };
};

module.exports = {
    register,
    login,
    sendOtp,
    verifyOtp,
    resetPassword
};
