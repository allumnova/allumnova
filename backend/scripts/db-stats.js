const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log('--- DB STATISTICS ---');
    const userCount = await prisma.user.count();
    const postCount = await prisma.post.count();
    const collegeCount = await prisma.college.count();
    const commentCount = await prisma.comment.count();

    console.log(`Users: ${userCount}`);
    console.log(`Posts: ${postCount}`);
    console.log(`Colleges: ${collegeCount}`);
    console.log(`Comments: ${commentCount}`);

    if (userCount > 0) {
        const users = await prisma.user.findMany({ take: 5, select: { id: true, name: true, email: true } });
        console.log('\nSample Users:');
        users.forEach(u => console.log(`- ${u.name} (${u.email}) [ID: ${u.id}]`));
    }

    process.exit(0);
}

main().catch(err => {
    console.error(err);
    process.exit(1);
});
