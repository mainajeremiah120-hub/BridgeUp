"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
async function main() {
    console.log('Seeding database...');
    const skillsData = [
        'JavaScript', 'TypeScript', 'Python', 'Go', 'Rust',
        'React', 'Next.js', 'NestJS', 'PostgreSQL', 'Redis',
        'Docker', 'Kubernetes', 'Cybersecurity', 'UI/UX Design'
    ];
    for (const name of skillsData) {
        await prisma.skill.upsert({
            where: { name },
            update: {},
            create: { name }
        });
    }
    console.log('Skills seeded.');
    const kenya = await prisma.community.upsert({
        where: { slug: 'kenya' },
        update: {},
        create: {
            name: 'Kenya',
            slug: 'kenya',
            description: 'Kenya national community hub',
            level: 0
        }
    });
    const nairobi = await prisma.community.upsert({
        where: { slug: 'nairobi' },
        update: {},
        create: {
            name: 'Nairobi',
            slug: 'nairobi',
            description: 'Nairobi city community hub',
            parentId: kenya.id,
            level: 1
        }
    });
    const mmu = await prisma.community.upsert({
        where: { slug: 'multimedia-university' },
        update: {},
        create: {
            name: 'Multimedia University',
            slug: 'multimedia-university',
            description: 'Multimedia University of Kenya student hub',
            parentId: nairobi.id,
            level: 2
        }
    });
    const softEng = await prisma.community.upsert({
        where: { slug: 'software-engineering' },
        update: {},
        create: {
            name: 'Software Engineering',
            slug: 'software-engineering',
            description: 'Software Engineering department community',
            parentId: mmu.id,
            level: 3
        }
    });
    const cyber = await prisma.community.upsert({
        where: { slug: 'cybersecurity' },
        update: {},
        create: {
            name: 'Cybersecurity',
            slug: 'cybersecurity',
            description: 'Cybersecurity interest and study group',
            parentId: softEng.id,
            level: 4
        }
    });
    const communities = [kenya, nairobi, mmu, softEng, cyber];
    for (const community of communities) {
        const channelNames = ['general', 'announcements', 'study-group'];
        for (const name of channelNames) {
            const existingChannel = await prisma.channel.findFirst({
                where: {
                    communityId: community.id,
                    name
                }
            });
            if (!existingChannel) {
                await prisma.channel.create({
                    data: {
                        communityId: community.id,
                        name,
                        type: 'text'
                    }
                });
            }
        }
    }
    console.log('Hierarchical communities and default channels seeded successfully!');
}
main()
    .catch((e) => {
    console.error(e);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
//# sourceMappingURL=seed.js.map