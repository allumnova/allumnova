const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
    try {
        const u = await prisma.user.count();
        const c = await prisma.college.count();
        const cr = await prisma.collegeRequest.count();
        const cm = await prisma.collegeMembership.count({ where: { status: 'PENDING' } });
        const cm_all = await prisma.collegeMembership.count();
        
        console.log('--- DB Audit ---');
        console.log(JSON.stringify({
            users: u,
            colleges: c,
            hubRequests: cr,
            allMemberships: cm_all,
            pendingMemberships: cm
        }, null, 2));

        const pendingList = await prisma.collegeMembership.findMany({
            where: { status: 'PENDING' },
            take: 5
        });
        console.log('Sample Pending:', JSON.stringify(pendingList, null, 2));

    } catch (err) {
        console.error('Audit Error:', err);
    } finally {
        await prisma.$disconnect();
    }
}

check();
