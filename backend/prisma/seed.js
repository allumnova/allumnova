const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
    console.log('Sweep cleaning database...');

    // Delete in FK-safe order using the new model names
    await prisma.analyticsEvent.deleteMany({});
    await prisma.report.deleteMany({});
    await prisma.eventAttendee.deleteMany({});
    await prisma.event.deleteMany({});
    await prisma.mentorshipRequest.deleteMany({});
    await prisma.jobApplication.deleteMany({});
    await prisma.job.deleteMany({});
    await prisma.notification.deleteMany({});
    await prisma.message.deleteMany({});
    await prisma.conversationMember.deleteMany({});
    await prisma.conversation.deleteMany({});
    await prisma.connection.deleteMany({});
    await prisma.postLike.deleteMany({});
    await prisma.comment.deleteMany({});
    await prisma.postMedia.deleteMany({});
    await prisma.savedPost.deleteMany({});
    await prisma.post.deleteMany({});
    await prisma.collegeMembership.deleteMany({});
    await prisma.college.deleteMany({});
    await prisma.user.deleteMany({});

    console.log('✅ Database cleaned.');

    // 1. Create Admin User
    const hashedPassword = await bcrypt.hash('admin123', 10);
    const admin = await prisma.user.create({
        data: {
            email: 'admin@allumnova.com',
            password_hash: hashedPassword, // PRD: password_hash
            name: 'Admin',
            username: 'admin',
            role: 'admin',
            is_verified: true,
            verificationLevel: 'VERIFIED',
            reputationScore: 100,
        },
    });
    console.log(`👤 Admin created: ${admin.email}`);

    // 1.1 Create User Requested Admin
    const userHashedPassword = await bcrypt.hash('Kulwant', 10);
    const userAdmin = await prisma.user.create({
        data: {
            email: 'vipranshusachan@gmail.com',
            password_hash: userHashedPassword,
            name: 'Vipranshu Sachan',
            username: 'vipranshu',
            role: 'admin',
            is_verified: true,
            verificationLevel: 'VERIFIED',
            reputationScore: 100,
        },
    });
    console.log(`👤 New Admin created: ${userAdmin.email}`);

    // 2. Create HBTU College
    const hbtu = await prisma.college.create({
        data: {
            name: 'HBTU Kanpur',
            domain: 'hbtu.edu.in', // PRD: domain
            subdomain: 'hbtu',
            location: 'Kanpur, UP',
            website: 'https://hbtu.ac.in',
            primaryColor: '#1A237E',
        },
    });
    console.log(`🏫 College created: ${hbtu.name}`);

    console.log('\n🎉 Seed complete!');
    console.log('   Admin login: admin@allumnova.com / admin123');
    console.log('   New Admin login: vipranshusachan@gmail.com / mnbvcxz');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
