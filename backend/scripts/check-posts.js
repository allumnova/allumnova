const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log('--- FETCHING LAST 20 POSTS ---');
    const posts = await prisma.post.findMany({
        take: 20,
        orderBy: { createdAt: 'desc' },
        include: {
            author: { select: { name: true, email: true } },
            college: { select: { name: true } }
        }
    });

    posts.forEach(post => {
        console.log(`[${post.createdAt.toISOString()}] ${post.author.name} (${post.college.name}): ${post.content.substring(0, 50)}... [ID: ${post.id}]`);
    });

    console.log('\n--- FETCHING COLLEGES ---');
    const colleges = await prisma.college.findMany();
    colleges.forEach(c => console.log(`[${c.id}] ${c.name}`));

    process.exit(0);
}

main().catch(err => {
    console.error(err);
    process.exit(1);
});
