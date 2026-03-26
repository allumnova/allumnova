const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const colleges = await prisma.college.findMany();
    if (colleges.length === 0) {
        console.log('No colleges found to seed environments for.');
        return;
    }

    const collegeId = colleges[0].id;
    const environments = [
        { name: 'Robotics & Automation Club', type: 'club', description: 'Exploring the future of hardware and AI interaction.' },
        { name: 'AI & Data Science Lab', type: 'lab', description: 'Advanced research environment for machine learning models.' },
        { name: 'Entrepreneurship Cell', type: 'club', description: 'Building the next generation of startups.' },
        { name: 'Class of 2026 Batch', type: 'batch', description: 'Official networking hub for the 2026 batch.' },
        { name: 'Computer Science Department', type: 'department', description: 'Core academic hub for CS students.' }
    ];

    for (const env of environments) {
        await prisma.environment.upsert({
            where: { id: `seed-${env.name.replace(/\s+/g, '-').toLowerCase()}-${collegeId}` },
            update: {},
            create: {
                ...env,
                collegeId
            }
        });
    }

    console.log(`Seeded ${environments.length} environments for college: ${colleges[0].name}`);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
