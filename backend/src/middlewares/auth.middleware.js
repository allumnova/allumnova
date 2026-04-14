const jwt = require('jsonwebtoken');
const prisma = require('../models');

const authenticate = async (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    console.log(`DEBUG: Authenticate - Header: ${authHeader ? 'Present' : 'Missing'}, Token: ${token ? 'Present' : 'Missing'}`);

    if (!token) {
        return res.status(401).json({ success: false, error: 'Unauthorized: No token provided' });
    }

    // Support for demo token in development
    if (token === 'demo_token' && process.env.NODE_ENV === 'development') {
        try {
            // Dynamically find the first admin user for demo mode
            const user = await prisma.user.findFirst({
                where: { role: 'admin' },
                select: {
                    id: true,
                    email: true,
                    name: true,
                    role: true,
                    is_verified: true,
                    verificationLevel: true,
                    colleges: {
                        where: { status: 'VERIFIED' },
                        select: { collegeId: true, role: true, status: true }
                    }
                }
            });

            if (!user) {
                console.warn('AUTH: Demo mode attempted but no admin user exists in DB. Did you run the seed?');
                return res.status(401).json({
                    success: false,
                    error: 'Authentication failed: Database is empty or seed not run.',
                    code: 'DB_EMPTY'
                });
            }

            const userId = user.id;

            req.user = {
                id: userId,
                userId: userId,
                email: user.email,
                name: user.name,
                role: user.role,
                is_verified: user.is_verified,
                colleges: user.colleges.map(m => ({ id: m.collegeId, role: m.role, status: m.status }))
            };
            return next();
        } catch (error) {
            console.error('Demo auth error:', error);
            return res.status(500).json({ success: false, error: 'Auth failed' });
        }
    }

    jwt.verify(token, process.env.JWT_SECRET, async (err, decoded) => {
        if (err) {
            return res.status(403).json({ success: false, error: 'Forbidden: Invalid token' });
        }

        try {
            // --- Multi-Device Session Validation ---
            if (decoded.sessionId) {
                const activeSession = await prisma.session.findUnique({
                    where: { id: decoded.sessionId, isRevoked: false }
                });
                
                if (!activeSession) {
                    console.log(`AUTH: Session ${decoded.sessionId} is revoked or expired.`);
                    return res.status(401).json({ 
                        success: false, 
                        error: 'Unauthorized: Session ended or logged in from another device.',
                        code: 'SESSION_REVOKED'
                    });
                }
            }

            // Fetch latest user data
            const user = await prisma.user.findUnique({
                where: { id: decoded.userId },
                select: {
                    id: true,
                    email: true,
                    name: true,
                    role: true,
                    is_verified: true,
                    verificationLevel: true,
                    reputationScore: true,
                    tierLevel: true,
                    colleges: {
                        select: { collegeId: true, role: true, status: true }
                    }
                }
            });

            if (!user) {
                return res.status(401).json({ success: false, error: 'Unauthorized: User not found' });
            }

            req.user = {
                ...decoded,
                ...user,
                userId: decoded.userId,
                colleges: user.colleges.map(m => ({ id: m.collegeId, role: m.role, status: m.status }))
            };
            next();
        } catch (error) {
            console.error('Auth error:', error);
            return res.status(500).json({ success: false, error: 'Authentication internal error' });
        }
    });
};

const authenticateOptional = async (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        req.user = null;
        return next();
    }

    // Reuse the same logic as authenticate but don't fail if token is missing
    // (In a real app, I'd refactor the verification logic into a helper)
    jwt.verify(token, process.env.JWT_SECRET, async (err, decoded) => {
        if (err) {
            console.log(`AUTH: Optional token found but invalid (${err.message})`);
            req.user = null;
            return next();
        }

        try {
            // Fetch session if provided
            if (decoded.sessionId) {
                const activeSession = await prisma.session.findUnique({
                    where: { id: decoded.sessionId, isRevoked: false }
                });
                if (!activeSession) {
                    req.user = null;
                    return next();
                }
            }

            const user = await prisma.user.findUnique({
                where: { id: decoded.userId },
                select: {
                    id: true,
                    email: true,
                    name: true,
                    role: true,
                    is_verified: true,
                    verificationLevel: true,
                    colleges: {
                        select: { collegeId: true, role: true, status: true }
                    }
                }
            });

            if (!user) {
                req.user = null;
            } else {
                req.user = {
                    ...decoded,
                    ...user,
                    userId: decoded.userId,
                    colleges: user.colleges.map(m => ({ id: m.collegeId, role: m.role, status: m.status }))
                };
            }
            next();
        } catch (error) {
            console.error('Auth optional error:', error);
            req.user = null;
            next();
        }
    });
};

const isAdmin = (req, res, next) => {
    if (!req.user || req.user.role !== 'admin') {
        return res.status(403).json({ success: false, error: 'Access denied: Admin role required' });
    }
    next();
};

const checkVerified = (req, res, next) => {
    if (!req.user.is_verified && req.user.role !== 'admin') {
        return res.status(403).json({
            success: false,
            error: 'Account not verified. Please complete onboarding and wait for approval.',
            code: 'UNVERIFIED'
        });
    }
    next();
};

const checkCollegeAccess = (req, res, next) => {
    const collegeId = req.headers['x-college-id'];
    console.log(`DEBUG: checkCollegeAccess - CollegeID: ${collegeId}`);

    if (!collegeId) {
        return res.status(400).json({ success: false, error: 'Missing X-College-ID header' });
    }

    // Bypass check for Global Community (even for guests)
    if (collegeId === 'cl_global_allumnova') {
        req.collegeId = collegeId;
        return next();
    }

    if (!req.user) {
        return res.status(401).json({ success: false, error: 'Unauthorized: Guest access not allowed for this college' });
    }

    const collegeAssociation = req.user.colleges.find(c => c.id === collegeId);

    // Bypass check for Global Community
    if (collegeId === 'cl_global_allumnova') {
        req.collegeId = collegeId;
        return next();
    }

    if (!collegeAssociation) {
        return res.status(403).json({ success: false, error: 'Forbidden: No access to this college' });
    }

    if (collegeAssociation.status !== 'APPROVED' && req.user.role !== 'admin') {
        return res.status(403).json({
            success: false,
            error: 'Access to this college is pending verification.',
            code: 'COLLEGE_UNVERIFIED'
        });
    }

    req.collegeId = collegeId;
    next();
};

module.exports = {
    authenticate,
    authenticateOptional,
    checkVerified,
    checkCollegeAccess,
    isAdmin
};
