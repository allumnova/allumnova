const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log('--- FETCHING USERS ---');
    const users = await prisma.user.findMany({
        take: 10,
        select: { id: true, name: true, email: true, collegeRequests: true }
    });

    users.forEach(u => {
        console.log(`[${u.id}] ${u.name} (${u.email})`);
    });

    const postCount = await prisma.post.count();
    console.log(`\nTOTAL POSTS IN DB: ${postCount}`);

    process.exit(0);
}

main().catch(err => {
    console.error(err);
    process.exit(1);
});
