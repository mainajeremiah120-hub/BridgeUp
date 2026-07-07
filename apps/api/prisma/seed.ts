import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // 1. Create Skills
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

  // 2. Create hierarchical communities
  // Level 0: Country
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

  // Level 1: City (Parent is Kenya)
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

  // Level 2: University (Parent is Nairobi)
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

  // Level 3: Major / Department (Parent is Multimedia University)
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

  // Level 4: Specialization / Niche Group (Parent is Software Engineering)
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

  // Create default channels for these communities
  const communities = [kenya, nairobi, mmu, softEng, cyber];
  for (const community of communities) {
    const channelNames = ['general', 'announcements', 'study-group'];
    for (const name of channelNames) {
      // Check if channel already exists
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

  // 3. Create top-level Interests (matches PRODUCT_VISION.md)
  const interestNames = [
    'Programming', 'Cybersecurity', 'AI', 'Psychology', 'Fitness',
    'Business', 'Startups', 'Design', 'Music', 'Photography', 'Languages'
  ];
  const interests: Record<string, { id: number }> = {};
  for (const name of interestNames) {
    interests[name] = await prisma.interest.upsert({
      where: { name },
      update: {},
      create: { name },
    });
  }
  console.log('Interests seeded.');

  // 4. Create flat, interest-first communities (the new BridgeUp model, alongside
  // the legacy hierarchical hubs above)
  const interestCommunitiesData = [
    { name: 'AI Builders', slug: 'ai-builders', description: 'Global community for people building with AI.' },
    { name: 'Cybersecurity Beginners', slug: 'cybersecurity-beginners', description: 'Learn cybersecurity fundamentals and CTFs together.' },
    { name: 'Startup Founders Circle', slug: 'startup-founders-circle', description: 'Founders trading notes on building and shipping.' },
    { name: 'UI/UX Design Lab', slug: 'ui-ux-design-lab', description: 'Portfolio reviews and design critique for builders.' },
  ];

  const interestCommunities: Record<string, { id: string }> = {};
  for (const data of interestCommunitiesData) {
    const community = await prisma.community.upsert({
      where: { slug: data.slug },
      update: {},
      create: { ...data, level: 0 },
    });
    interestCommunities[data.slug] = community;

    for (const name of ['general', 'announcements', 'study-group']) {
      const existingChannel = await prisma.channel.findFirst({
        where: { communityId: community.id, name },
      });
      if (!existingChannel) {
        await prisma.channel.create({
          data: { communityId: community.id, name, type: 'text' },
        });
      }
    }
  }
  console.log('Interest-first communities seeded.');

  // 5. Seed a handful of starter discussions (authored by "BridgeUp" - authorId left
  // null so we never impersonate a real user)
  const discussionSeeds = [
    {
      title: 'What should I learn after Python?',
      body: 'Curious what people recommend picking up next once you are comfortable with core Python - a framework, a language, or a specialization?',
      interestTag: 'Programming',
      communitySlug: 'ai-builders',
    },
    {
      title: 'Best beginner cybersecurity labs?',
      body: 'Looking for hands-on labs or CTF platforms that are approachable for someone just starting out in security.',
      interestTag: 'Cybersecurity',
      communitySlug: 'cybersecurity-beginners',
    },
    {
      title: 'Is AI replacing junior designers?',
      body: 'Seeing a lot of AI-generated UI mockups lately - what does that mean for people starting out in design?',
      interestTag: 'Design',
      communitySlug: 'ui-ux-design-lab',
    },
    {
      title: 'How do you stay consistent building a startup solo?',
      body: 'Would love to hear how other solo founders keep momentum without a co-founder to keep them accountable.',
      interestTag: 'Startups',
      communitySlug: 'startup-founders-circle',
    },
  ];

  for (const seedItem of discussionSeeds) {
    const community = interestCommunities[seedItem.communitySlug];
    const existing = await prisma.discussion.findFirst({ where: { title: seedItem.title } });
    if (!existing) {
      await prisma.discussion.create({
        data: {
          title: seedItem.title,
          body: seedItem.body,
          interestTag: seedItem.interestTag,
          communityId: community?.id,
        },
      });
    }
  }
  console.log('Starter discussions seeded.');

  // 6. Seed a handful of upcoming starter events (hostId left null, same reasoning)
  const now = Date.now();
  const eventSeeds = [
    {
      title: 'Build your first API',
      description: 'A live, beginner-friendly workshop on building your first REST API.',
      interestTag: 'Programming',
      communitySlug: 'ai-builders',
      startsAt: new Date(now + 1000 * 60 * 60 * 6),
    },
    {
      title: 'Beginner CTF Sprint',
      description: 'A relaxed capture-the-flag session for people new to cybersecurity.',
      interestTag: 'Cybersecurity',
      communitySlug: 'cybersecurity-beginners',
      startsAt: new Date(now + 1000 * 60 * 60 * 30),
    },
    {
      title: 'Design Portfolio Reviews',
      description: 'Bring your portfolio for live, constructive feedback from the community.',
      interestTag: 'Design',
      communitySlug: 'ui-ux-design-lab',
      startsAt: new Date(now + 1000 * 60 * 60 * 54),
    },
    {
      title: 'Global Founder Standup',
      description: 'A weekly async-friendly standup for founders to share progress and blockers.',
      interestTag: 'Startups',
      communitySlug: 'startup-founders-circle',
      startsAt: new Date(now + 1000 * 60 * 60 * 78),
    },
  ];

  for (const seedItem of eventSeeds) {
    const community = interestCommunities[seedItem.communitySlug];
    const existing = await prisma.event.findFirst({ where: { title: seedItem.title } });
    if (!existing) {
      await prisma.event.create({
        data: {
          title: seedItem.title,
          description: seedItem.description,
          interestTag: seedItem.interestTag,
          communityId: community?.id,
          startsAt: seedItem.startsAt,
        },
      });
    }
  }
  console.log('Starter events seeded.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
