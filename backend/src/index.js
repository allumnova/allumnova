const express = require('express');
require('dotenv').config();
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const http = require('http');
const socketUtil = require('./utils/socket');

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 5000;

// Initialize Socket.io
socketUtil.init(server);

// Route Imports
const authRoutes = require('./modules/auth/auth.routes');
const collegeRoutes = require('./modules/college/college.routes');
const feedRoutes = require('./modules/feed/feed.routes');
const profileRoutes = require('./modules/profile/profile.routes');
const socialRoutes = require('./modules/social/social.routes');
const chatRoutes = require('./modules/chat/chat.routes');
const notificationRoutes = require('./modules/notification/notification.routes');
const adminRoutes = require('./modules/admin/admin.routes');
const environmentRoutes = require('./modules/environment/environment.routes');
const projectRoutes = require('./modules/project/project.routes');

// Middlewares
app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(morgan('dev'));
app.use('/uploads', express.static('uploads'));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/colleges', collegeRoutes);
app.use('/api/feed', feedRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/social', socialRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/environments', environmentRoutes);
const reputationRoutes = require('./modules/reputation/reputation.routes');
app.use('/api/reputation', reputationRoutes);
const mentorshipRoutes = require('./modules/mentorship/mentorship.routes');
app.use('/api/mentorship', mentorshipRoutes);
app.use('/api/projects', projectRoutes);

app.get('/api/health', (req, res) => {
    res.json({ status: 'healthy', timestamp: new Date() });
});

// 404 Handler
app.use((req, res, next) => {
    res.status(404).json({ success: false, error: `Route ${req.method} ${req.url} not found` });
});

// Global Error Handler
app.use((err, req, res, next) => {
    console.error('GLOBAL ERROR:', err);
    res.status(err.status || 500).json({
        success: false,
        error: err.message || 'Internal Server Error',
        stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
});

// Start Server
server.listen(PORT, '0.0.0.0', () => {
    console.log(`Backend service running on port ${PORT}`);
});
