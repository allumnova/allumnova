const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function repair() {
    console.log('🛠️ REPAIR: Fixing legacy "VERIFIED" statuses to "APPROVED"...');

    // 1. Update all memberships that are in 'VERIFIED' status to 'APPROVED'
    const updatedMemberships = await prisma.collegeMembership.updateMany({
        where: {
            status: {
                in: ['VERIFIED', 'verified']
            }
        },
        data: {
            status: 'APPROVED'
        }
    });
    console.log(`✅ Updated ${updatedMemberships.count} memberships to APPROVED.`);

    // 2. Find users who have an APPROVED membership but are still is_verified: false
    const pendingUsers = await prisma.user.findMany({
        where: {
            is_verified: false,
            colleges: {
                some: {
                    status: 'APPROVED'
                }
            }
        }
    });

    for (const user of pendingUsers) {
        await prisma.user.update({
            where: { id: user.id },
            data: { 
                is_verified: true,
                verificationLevel: 'VERIFIED'
            }
        });
        console.log(`👤 User fixed: ${user.email}`);
    }

    console.log('\n✨ Repair complete. All users are now synchronized!');
}

repair()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
