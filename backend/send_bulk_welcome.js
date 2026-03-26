const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    // We import emailService inside main to catch import errors
    let emailService;
    try {
        emailService = require('./src/utils/email.service');
    } catch (e) {
        console.error('FAILED TO IMPORT EMAIL SERVICE:', e);
        return;
    }

    console.log('Fetching verified users...');
    try {
        const users = await prisma.user.findMany({
            where: { 
                is_verified: true,
                role: { not: 'admin' }
            },
        });

        console.log(`Found ${users.length} verified users. Sending welcome emails...`);

        for (const user of users) {
            try {
                console.log(`Sending to ${user.email} (${user.name})...`);
                await emailService.sendWelcomeEmail(user.email, user.name);
                console.log(`- Success for ${user.email}`);
            } catch (error) {
                console.error(`- Error sending to ${user.email}:`, error);
            }
        }
    } catch (e) {
        console.error('DATABASE ERROR:', e);
    }

    console.log('Bulk email process completed.');
}

main()
    .catch(e => {
        console.error('GLOBAL SCRIPT ERROR:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
