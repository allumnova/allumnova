const prisma = require('../../models');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { createClient } = require('redis');
const { sendOTP } = require('../../utils/email.service');

const redisClient = createClient({ url: process.env.REDIS_URL });
redisClient.on('error', (err) => console.log('Auth Redis Client Error', err));

(async () => {
    try {
        await redisClient.connect();
    } catch (err) {
        console.error('Failed to connect to Redis from Auth Service', err);
    }
})();

const register = async (userData) => {
    const { email, password, name, organizationName } = userData;

    // Check if user already exists in DB
    const existingUser = await prisma.user.findFirst({ where: { email } });
    if (existingUser) {
        throw new Error('User already exists');
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Cache registration metadata in Redis (15 mins)
    await redisClient.setEx(`signup:metadata:${email}`, 900, JSON.stringify({
        email,
        password: hashedPassword,
        name,
        organizationName: organizationName || 'My Enterprise'
    }));

    // Store OTP in Redis (5 mins)
    await redisClient.setEx(`otp:${email}`, 300, otp);

    // Send OTP via email
    try {
        await sendOTP(email, otp);
    } catch (error) {
        console.warn('Mail send failed, printing OTP to console:', otp);
    }

    return { message: 'OTP sent to your email. Please verify to complete registration.' };
};

const login = async (email, password) => {
    const user = await prisma.user.findFirst({
        where: { email },
        include: {
            organization: true
        }
    });

    if (!user || !(await bcrypt.compare(password, user.password_hash))) {
        throw new Error('Invalid credentials');
    }

    if (!user.isActive) {
        throw new Error('This account is suspended');
    }

    // --- Multi-Device Session Management ---
    const activeSessions = await prisma.session.count({
        where: { userId: user.id, isRevoked: false }
    });

    if (activeSessions >= 3) {
        const oldestSession = await prisma.session.findFirst({
            where: { userId: user.id, isRevoked: false },
            orderBy: { createdAt: 'asc' }
        });
        if (oldestSession) {
            await prisma.session.delete({ where: { id: oldestSession.id } });
        }
    }

    const session = await prisma.session.create({
        data: { userId: user.id }
    });

    const token = jwt.sign(
        {
            userId: user.id,
            sessionId: session.id,
            organizationId: user.organizationId,
            role: user.role
        },
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
    );

    return { user, token };
};

const sendOtp = async (email) => {
    const user = await prisma.user.findFirst({ where: { email } });
    const signupData = await redisClient.get(`signup:metadata:${email}`);

    if (!user && !signupData) {
        throw new Error('Email not recognized. Please sign up first.');
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    await redisClient.setEx(`otp:${email}`, 300, otp);

    try {
        await sendOTP(email, otp);
    } catch (error) {
        console.warn('Mail send failed, printing OTP to console:', otp);
    }

    return { message: 'OTP sent successfully' };
};

const verifyOtp = async (email, otp) => {
    const storedOtp = await redisClient.get(`otp:${email}`);

    if (!storedOtp || storedOtp !== otp) {
        throw new Error('Invalid or expired OTP');
    }

    const registrationData = await redisClient.get(`signup:metadata:${email}`);
    let user;

    if (registrationData) {
        const { email: regEmail, password, name, organizationName } = JSON.parse(registrationData);

        // 1. Create Organization
        const domain = regEmail.split('@')[1];
        const org = await prisma.organization.create({
            data: {
                name: organizationName,
                domain: domain,
                subscriptionPlan: 'FREE'
            }
        });

        // 2. Create the User (First user in organization is ADMIN)
        user = await prisma.user.create({
            data: {
                email: regEmail,
                password_hash: password,
                name,
                organizationId: org.id,
                role: 'ADMIN',
                isActive: true
            },
            include: {
                organization: true
            }
        });

        await redisClient.del(`signup:metadata:${email}`);
    } else {
        user = await prisma.user.findFirst({
            where: { email },
            include: {
                organization: true
            }
        });
    }

    if (!user) {
        throw new Error('User not found');
    }

    await redisClient.del(`otp:${email}`);

    const activeSessions = await prisma.session.count({
        where: { userId: user.id, isRevoked: false }
    });

    if (activeSessions >= 3) {
        const oldestSession = await prisma.session.findFirst({
            where: { userId: user.id, isRevoked: false },
            orderBy: { createdAt: 'asc' }
        });
        if (oldestSession) {
            await prisma.session.delete({ where: { id: oldestSession.id } });
        }
    }

    const session = await prisma.session.create({
        data: { userId: user.id }
    });

    const token = jwt.sign(
        {
            userId: user.id,
            sessionId: session.id,
            organizationId: user.organizationId,
            role: user.role
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

    const user = await prisma.user.findFirst({ where: { email } });
    if (!user) {
        throw new Error('User not found');
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
        where: { id: user.id },
        data: { password_hash: hashedPassword }
    });

    await redisClient.del(`otp:${email}`);

    return { message: 'Password reset successfully' };
};

const registerFcmToken = async (userId, token) => {
    // Legacy support (optional FCM logic if user requires push notifications)
    return { success: true };
};

module.exports = {
    register,
    login,
    sendOtp,
    verifyOtp,
    resetPassword,
    registerFcmToken
};
