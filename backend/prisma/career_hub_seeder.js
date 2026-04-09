const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const bcrypt = require('bcryptjs');

async function main() {
    console.log('--- 🚀 Starting High-Signal Career Seeding ---');

    // 1. Create a "Superstar" Alumnus
    const passwordHash = await bcrypt.hash('password123', 10);
    const superAlumni = await prisma.user.upsert({
        where: { email: 'sarah.founder@example.com' },
        update: {},
        create: {
            email: 'sarah.founder@example.com',
            name: 'Sarah Chen',
            password_hash: passwordHash,
            role: 'user',
            username: 'sarahchen',
            bio: 'Founder at TechFlow. ex-Google SDE. Building the future of productive social.',
            department: 'Computer Science',
            targetRole: 'Founder',
            careerStage: 'WORKING',
            completionRatio: 95,
            linkedIn: 'https://linkedin.com/in/sarahchen',
            githubUrl: 'https://github.com/sarahchen',
            is_verified: true,
            verificationLevel: 'VERIFIED',
            tierLevel: 'Nova',
            reputationScore: 2500
        }
    });

    // 2. Create a "High-Potential" Student
    const superstarStudent = await prisma.user.upsert({
        where: { email: 'alex.dev@example.com' },
        update: {},
        create: {
            email: 'alex.dev@example.com',
            name: 'Alex Rivera',
            password_hash: passwordHash,
            role: 'user',
            username: 'arivera',
            bio: 'Fullstack Dev | Aspiring SDE at Tier 1. Building AI-driven hubs.',
            department: 'Information Technology',
            targetRole: 'SDE',
            careerStage: 'STUDENT',
            completionRatio: 88,
            githubUrl: 'https://github.com/arivera',
            is_verified: true,
            verificationLevel: 'VERIFIED',
            tierLevel: 'Pulse',
            reputationScore: 1200
        }
    });

    // 3. Add Professional Milestones
    await prisma.certification.createMany({
        data: [
            { userId: superAlumni.id, title: 'AWS Solutions Architect', organization: 'Amazon Web Services', credentialUrl: 'https://aws.amazon.com' },
            { userId: superstarStudent.id, title: 'Meta Front-End Developer', organization: 'Coursera/Meta', credentialUrl: 'https://coursera.org' }
        ]
    });

    await prisma.education.createMany({
        data: [
            { userId: superstarStudent.id, school: 'Allumnova Institute of Technology', degree: 'Bachelor of Technology', field: 'CS', startDate: new Date('2021-08-01'), description: '9.2 CGPA' }
        ]
    });

    // 4. Create "Showcase" Projects
    const aiHub = await prisma.environment.findFirst({ where: { name: { contains: 'AI' } } });
    if (aiHub) {
        await prisma.project.create({
            data: {
                title: 'Allumnova AI Engine',
                description: 'A custom LLM implementation for career roadmap automation. Built with PyTorch and Next.js.',
                ownerId: superAlumni.id,
                collegeId: (await prisma.college.findFirst())?.id || '',
                repoUrl: 'https://github.com/allumnova/ai-engine',
                mediaUrls: ['https://images.unsplash.com/photo-1677442136019-21780ecad995'],
                status: 'BUILDING'
            }
        });

        await prisma.post.create({
            data: {
                title: 'Building the Career Engine',
                content: 'Just deployed the first version of the Strength Recalculation logic. Profile strength is now weighted by project proof! 🚀 #BuildInPublic',
                authorId: superAlumni.id,
                visibility: 'public',
                type: 'PROJECT',
                collegeId: (await prisma.college.findFirst())?.id || ''
            }
        });
    }

    console.log('--- ✅ Seeding Complete: High-signal data is ready! ---');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
