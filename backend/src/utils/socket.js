const { Server } = require('socket.io');

let io;

const init = (server) => {
    io = new Server(server, {
        cors: {
            origin: '*', // Adjust for production
            methods: ['GET', 'POST']
        }
    });

    io.on('connection', (socket) => {
        console.log('Client connected:', socket.id);

        socket.on('join', (userId) => {
            socket.join(`user:${userId}`);
            console.log(`User ${userId} joined their notification room`);
        });

        socket.on('joinCollege', (collegeId) => {
            socket.join(`college:${collegeId}`);
            console.log(`Socket joined college room: ${collegeId}`);
        });

        socket.on('disconnect', () => {
            console.log('Client disconnected:', socket.id);
        });
    });

    return io;
};

const getIO = () => {
    if (!io) {
        throw new Error('Socket.io not initialized!');
    }
    return io;
};

const sendToUser = (userId, event, data) => {
    if (io) {
        io.to(`user:${userId}`).emit(event, data);
    }
};

const sendToCollege = (collegeId, event, data) => {
    if (io) {
        io.to(`college:${collegeId}`).emit(event, data);
    }
};

module.exports = {
    init,
    getIO,
    sendToUser,
    sendToCollege
};
