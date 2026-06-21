const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const generateSlug = (name) => {
    return name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '');
};

async function migrate() {
    console.log('🔄 STARTING DATA MIGRATION: Colleges to Environments...');

    // 1. Fetch colleges and existing environments
    const colleges = await prisma.college.findMany();
    const existingEnvs = await prisma.environment.findMany();

    const usedSlugs = new Set(existingEnvs.map(e => e.slug).filter(Boolean));

    console.log(`Found ${colleges.length} colleges and ${existingEnvs.length} existing environments.`);

    // 2. Convert each College into a first-class COLLEGE Environment
    for (const college of colleges) {
        // Check if environment already exists for this college
        let env = existingEnvs.find(e => e.collegeId === college.id && e.category === 'COLLEGE');
        
        if (!env) {
            let slug = generateSlug(college.name);
            let counter = 1;
            const baseSlug = slug;
            while (usedSlugs.has(slug)) {
                slug = `${baseSlug}-${counter}`;
                counter++;
            }
            usedSlugs.add(slug);

            env = await prisma.environment.create({
                data: {
                    collegeId: college.id,
                    name: `${college.name} Community`,
                    slug: slug,
                    icon: college.logo,
                    description: `Official campus community space for ${college.name}.`,
                    type: 'HUB',
                    category: 'COLLEGE',
                    privacyType: 'PUBLIC',
                    privacyLevel: 'PUBLIC',
                    status: 'VERIFIED',
                    config: {
                        type: 'college',
                        enabledModules: ['feed', 'members', 'connections', 'circles', 'events', 'chat', 'announcements'],
                        memberFilters: ['branch', 'batch', 'seniority', 'club', 'open_to_connect'],
                        postTypes: ['text', 'image', 'question', 'announcement', 'event', 'lost_found'],
                        homeWidgets: ['campus_feed', 'batch_circles', 'student_clubs', 'upcoming_events', 'suggested_seniors']
                    }
                }
            });
            console.log(`✅ Created environment for college: "${college.name}" -> slug: "${slug}"`);
        } else {
            let slug = env.slug || generateSlug(college.name);
            if (!env.slug) {
                let counter = 1;
                const baseSlug = slug;
                while (usedSlugs.has(slug)) {
                    slug = `${baseSlug}-${counter}`;
                    counter++;
                }
                usedSlugs.add(slug);
            }
            await prisma.environment.update({
                where: { id: env.id },
                data: {
                    slug,
                    config: {
                        type: 'college',
                        enabledModules: ['feed', 'members', 'connections', 'circles', 'events', 'chat', 'announcements'],
                        memberFilters: ['branch', 'batch', 'seniority', 'club', 'open_to_connect'],
                        postTypes: ['text', 'image', 'question', 'announcement', 'event', 'lost_found'],
                        homeWidgets: ['campus_feed', 'batch_circles', 'student_clubs', 'upcoming_events', 'suggested_seniors']
                    }
                }
            });
            console.log(`🔧 Synchronized config & slug for existing college: "${college.name}"`);
        }
    }

    // Refresh environments list
    const updatedEnvs = await prisma.environment.findMany();

    // 3. Migrate legacy posts to reference their respective college environment
    const postsToMigrate = await prisma.post.findMany({
        where: {
            environmentId: null,
            collegeId: { not: null }
        }
    });

    console.log(`Migrating ${postsToMigrate.length} legacy posts to environments...`);
    for (const post of postsToMigrate) {
        const targetEnv = updatedEnvs.find(e => e.collegeId === post.collegeId && e.category === 'COLLEGE');
        if (targetEnv) {
            await prisma.post.update({
                where: { id: post.id },
                data: { environmentId: targetEnv.id }
            });
        }
    }

    // 4. Migrate legacy events to reference their respective college environment
    const eventsToMigrate = await prisma.event.findMany({
        where: {
            environmentId: null,
            collegeId: { not: null }
        }
    });

    console.log(`Migrating ${eventsToMigrate.length} legacy events to environments...`);
    for (const event of eventsToMigrate) {
        const targetEnv = updatedEnvs.find(e => e.collegeId === event.collegeId && e.category === 'COLLEGE');
        if (targetEnv) {
            await prisma.event.update({
                where: { id: event.id },
                data: { environmentId: targetEnv.id }
            });
        }
    }

    // 5. Migrate user college memberships to environment memberships
    const collegeMemberships = await prisma.collegeMembership.findMany();
    console.log(`Syncing ${collegeMemberships.length} memberships...`);

    for (const member of collegeMemberships) {
        const targetEnv = updatedEnvs.find(e => e.collegeId === member.collegeId && e.category === 'COLLEGE');
        if (targetEnv) {
            // Check if environment membership already exists
            const existingMembership = await prisma.environmentMembership.findUnique({
                where: {
                    userId_environmentId: {
                        userId: member.userId,
                        environmentId: targetEnv.id
                    }
                }
            });

            if (!existingMembership) {
                await prisma.environmentMembership.create({
                    data: {
                        userId: member.userId,
                        environmentId: targetEnv.id,
                        status: member.status, // APPROVED or PENDING
                        role: member.role === 'admin' ? 'ADMIN' : 'MEMBER'
                    }
                });
            }
        }
    }

    console.log('✨ DATA MIGRATION COMPLETE! All colleges and relations are successfully synchronized.');
}

migrate()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
