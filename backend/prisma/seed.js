const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
    console.log('🧹 CLEAN SWEEP: Clearing all existing data for launch...');

    // Delete in FK-safe order
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

    console.log('✅ Database cleared.');

    // 1. Create the ONLY Admin User (Your requested credentials)
    const adminEmail = 'vipranshusachan@gmail.com';
    const hashedPassword = await bcrypt.hash('mnbvcxz', 10);
    
    const admin = await prisma.user.create({
        data: {
            email: adminEmail,
            password_hash: hashedPassword,
            name: 'Vipranshu Sachan',
            username: 'admin-vips',
            role: 'admin',
            is_verified: true,
            verificationLevel: 'VERIFIED',
            reputationScore: 100,
        },
    });
    
    console.log(`👤 Platform Admin created: ${adminEmail}`);

    // 2. Create HBTU College
    const hbtu = await prisma.college.create({
        data: {
            name: 'HBTU Kanpur',
            domain: 'hbtu.edu.in',
            subdomain: 'hbtu',
            location: 'Kanpur, UP',
            website: 'https://hbtu.ac.in',
            primaryColor: '#1A237E',
        },
    });
    console.log(`🏫 College created: ${hbtu.name}`);

    console.log('\n🎉 ALLUMNOVA IS READY FOR LAUNCH!');
    console.log('   Admin login: vipranshusachan@gmail.com / mnbvcxz');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
