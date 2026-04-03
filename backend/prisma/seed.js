const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Starting non-destructive seeding...');

    // 1. Create Admin User (Only if not exists)
    const adminEmail = 'admin@allumnova.com';
    const existingAdmin = await prisma.user.findUnique({ where: { email: adminEmail } });

    if (!existingAdmin) {
        const hashedPassword = await bcrypt.hash('admin123', 10);
        await prisma.user.create({
            data: {
                email: adminEmail,
                password_hash: hashedPassword,
                name: 'Admin',
                username: 'admin',
                role: 'admin',
                is_verified: true,
                verificationLevel: 'VERIFIED',
                reputationScore: 100,
            },
        });
        console.log(`👤 Admin created: ${adminEmail}`);
    } else {
        console.log(`ℹ️ Admin already exists: ${adminEmail}`);
    }

    // 1.1 Create User Requested Admin (Only if not exists)
    const userAdminEmail = 'vipranshusachan@gmail.com';
    const existingUserAdmin = await prisma.user.findUnique({ where: { email: userAdminEmail } });

    if (!existingUserAdmin) {
        const userHashedPassword = await bcrypt.hash('Kulwant123', 10);
        await prisma.user.create({
            data: {
                email: userAdminEmail,
                password_hash: userHashedPassword,
                name: 'Vipranshu Sachan',
                username: 'vipranshu',
                role: 'admin',
                is_verified: true,
                verificationLevel: 'VERIFIED',
                reputationScore: 100,
            },
        });
        console.log(`👤 New Admin created: ${userAdminEmail}`);
    } else {
        console.log(`ℹ️ User Admin already exists: ${userAdminEmail}`);
    }

    // 2. Create HBTU College (Only if not exists)
    const collegeDomain = 'hbtu.edu.in';
    const existingCollege = await prisma.college.findUnique({ where: { domain: collegeDomain } });

    if (!existingCollege) {
        await prisma.college.create({
            data: {
                name: 'HBTU Kanpur',
                domain: collegeDomain,
                subdomain: 'hbtu',
                location: 'Kanpur, UP',
                website: 'https://hbtu.ac.in',
                primaryColor: '#1A237E',
            },
        });
        console.log(`🏫 College created: HBTU Kanpur`);
    } else {
        console.log(`ℹ️ College already exists: HBTU Kanpur`);
    }

    console.log('\n✅ Seeding logic completed (Safety Mode Active).');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
