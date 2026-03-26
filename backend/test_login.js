const authService = require('./src/modules/auth/auth.service');
const prisma = require('./src/models');

async function test() {
    try {
        console.log('Testing login for admin@allumnova.com...');
        const result = await authService.login('admin@allumnova.com', 'admin123');
        console.log('Login successful!');
        console.log('User:', result.user.email);
        console.log('Token generated');
    } catch (error) {
        console.error('Login failed:', error.message);

        const user = await prisma.user.findUnique({ where: { email: 'admin@allumnova.com' } });
        if (user) {
            console.log('User exists in database.');
            console.log('Hashed password in DB:', user.password_hash);
        } else {
            console.log('User NOT found in database.');
        }
    } finally {
        await prisma.$disconnect();
    }
}

test();
