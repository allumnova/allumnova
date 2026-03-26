const { createServer } = require('http');
const { Server } = require('socket.io');
const { createClient } = require('redis');

const httpServer = createServer();
const io = new Server(httpServer, {
    cors: {
        origin: "*",
    }
});

const redisClient = createClient({ url: process.env.REDIS_URL });

redisClient.on('error', (err) => console.log('Redis Client Error', err));

async function init() {
    await redisClient.connect();
    console.log('Connected to Redis for Socket.io Pub/Sub');

    io.on('connection', (socket) => {
        const userId = socket.handshake.query.userId;
        const collegeId = socket.handshake.query.collegeId;
        console.log(`User ${userId} connected to college: ${collegeId}`);

        if (userId) {
            socket.join(`user:${userId}`);
        }
        if (collegeId) {
            socket.join(`college:${collegeId}`);
        }

        socket.on('send_message', (data) => {
            const { receiverId, message } = data;
            // Broadcast to the specifically receiver's room
            io.to(`user:${receiverId}`).emit('new_message', {
                ...message,
                from: userId
            });
        });

        socket.on('typing', (data) => {
            const { receiverId } = data;
            io.to(`user:${receiverId}`).emit('user_typing', { from: userId });
        });

        socket.on('disconnect', () => {
            console.log(`User ${userId} disconnected`);
        });
    });

    const PORT = process.env.SOCKET_PORT || 5001;
    httpServer.listen(PORT, () => {
        console.log(`Socket.io server running on port ${PORT}`);
    });
}

init();
