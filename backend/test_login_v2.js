const authService = require('./src/modules/auth/auth.service');
const prisma = require('./src/models');
const fs = require('fs');

const logFile = 'login_debug.log';
const log = (msg) => {
    console.log(msg);
    fs.appendFileSync(logFile, msg + '\n');
};

async function test() {
    if (fs.existsSync(logFile)) fs.unlinkSync(logFile);

    try {
        log('Testing login for vipranshusachan@gmail.com...');
        const result = await authService.login('vipranshusachan@gmail.com', 'mnbvcxz');
        log('Login successful!');
        log('User: ' + result.user.email);
    } catch (error) {
        log('Login failed: ' + error.message);

        const user = await prisma.user.findUnique({ where: { email: 'vipranshusachan@gmail.com' } });
        if (user) {
            log('User exists in database.');
            log('Hashed password in DB: ' + user.password_hash);
        } else {
            log('User NOT found in database.');
            const allUsers = await prisma.user.findMany({ select: { email: true } });
            log('All users in DB: ' + JSON.stringify(allUsers));
        }
    } finally {
        await prisma.$disconnect();
        process.exit(0);
    }
}

test();
