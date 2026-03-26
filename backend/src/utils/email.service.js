const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.hostinger.com',
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_SECURE === 'true' || false,
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
});

const sendOTP = async (to, otp) => {
    try {
        const info = await transporter.sendMail({
            from: process.env.SMTP_FROM || '"Allumnova" <info@allumnova.com>',
            to,
            subject: 'Your Allumnova Verification Code',
            html: `
            <div style="font-family: Arial, sans-serif; max-w-md; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
                <h2 style="color: #3b82f6; text-align: center;">Welcome to Allumnova</h2>
                <p style="color: #475569; font-size: 16px;">Your verification code is:</p>
                <div style="background-color: #f1f5f9; padding: 15px; text-align: center; border-radius: 8px; margin: 20px 0;">
                    <strong style="font-size: 32px; letter-spacing: 5px; color: #0f172a;">${otp}</strong>
                </div>
                <p style="color: #64748b; font-size: 14px;">This code will expire in 5 minutes.</p>
                <p style="color: #94a3b8; font-size: 12px; margin-top: 30px; text-align: center;">If you didn't request this code, please ignore this email.</p>
            </div>
            `,
        });
        console.log('Message sent: %s', info.messageId);
        return true;
    } catch (error) {
        console.error('Error sending OTP email:', error);
        throw new Error('Could not send verification email.');
    }
};

const sendCollegeApproval = async (to, collegeName, subdomain) => {
    try {
        const info = await transporter.sendMail({
            from: process.env.SMTP_FROM || '"Allumnova" <info@allumnova.com>',
            to,
            subject: 'Your College is now on Allumnova!',
            html: `
            <div style="font-family: Arial, sans-serif; max-w-md; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
                <h2 style="color: #3b82f6; text-align: center;">Great News!</h2>
                <p style="color: #475569; font-size: 16px;">The college you suggested, <strong>${collegeName}</strong>, has been approved and is now live on Allumnova!</p>
                <div style="background-color: #f1f5f9; padding: 20px; text-align: center; border-radius: 8px; margin: 20px 0;">
                    <p style="margin: 0; color: #64748b; font-size: 14px;">You can now join your college community at:</p>
                    <p style="margin: 10px 0 0 0; font-size: 18px; color: #3b82f6; font-weight: bold;">${subdomain}.allumnova.com</p>
                </div>
                <p style="color: #64748b; font-size: 14px;">Login to your account and select "Join College" to get started.</p>
                <a href="${process.env.FRONTEND_URL}/login" style="display: block; background-color: #3b82f6; color: white; text-decoration: none; padding: 12px; text-align: center; border-radius: 8px; font-weight: bold; margin-top: 20px;">Join Now</a>
            </div>
            `,
        });
        console.log('Approval email sent: %s', info.messageId);
        return true;
    } catch (error) {
        console.error('Error sending approval email:', error);
        return false;
    }
};

const sendUserApproval = async (to, collegeName) => {
    try {
        const info = await transporter.sendMail({
            from: process.env.SMTP_FROM || '"Allumnova" <info@allumnova.com>',
            to,
            subject: 'Account Verified for ' + collegeName,
            html: `
            <div style="font-family: Arial, sans-serif; max-w-md; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
                <h2 style="color: #10b981; text-align: center;">Verified!</h2>
                <p style="color: #475569; font-size: 16px;">Good news! Your membership for <strong>${collegeName}</strong> has been approved by the administrator.</p>
                <div style="background-color: #f1f5f9; padding: 20px; text-align: center; border-radius: 8px; margin: 20px 0;">
                    <p style="margin: 0; color: #64748b; font-size: 14px;">You now have full access to the community feed, chat, and more.</p>
                </div>
                <a href="${process.env.FRONTEND_URL}/login" style="display: block; background-color: #10b981; color: white; text-decoration: none; padding: 12px; text-align: center; border-radius: 8px; font-weight: bold; margin-top: 20px;">Go to Feed</a>
            </div>
            `,
        });
        console.log('User approval email sent: %s', info.messageId);
        return true;
    } catch (error) {
        console.error('Error sending user approval email:', error);
        return false;
    }
};

const sendWelcomeEmail = async (to, name) => {
    try {
        const info = await transporter.sendMail({
            from: process.env.SMTP_FROM || '"Allumnova" <info@allumnova.com>',
            to,
            subject: 'Welcome to the Allumnova Community!',
            html: `
            <div style="font-family: Arial, sans-serif; max-w-md; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
                <h2 style="color: #3b82f6; text-align: center;">Welcome, ${name}!</h2>
                <p style="color: #475569; font-size: 16px;">Your account has been fully verified. You're now a part of the Allumnova network!</p>
                <div style="background-color: #f1f5f9; padding: 20px; text-align: center; border-radius: 8px; margin: 20px 0;">
                    <p style="margin: 0; color: #64748b; font-size: 14px;">Connect with fellow students and alumni, share experiences, and explore opportunities.</p>
                </div>
                <a href="${process.env.FRONTEND_URL}/login" style="display: block; background-color: #3b82f6; color: white; text-decoration: none; padding: 12px; text-align: center; border-radius: 8px; font-weight: bold; margin-top: 20px;">Explore Feed</a>
                <p style="color: #94a3b8; font-size: 12px; margin-top: 30px; text-align: center;">Crafted with ❤️ by the Allumnova Team</p>
            </div>
            `,
        });
        console.log('Welcome email sent: %s', info.messageId);
        return true;
    } catch (error) {
        console.error('Error sending welcome email:', error);
        return false;
    }
};

module.exports = {
    sendOTP,
    sendCollegeApproval,
    sendUserApproval,
    sendWelcomeEmail,
};
