import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class InterestsService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    const interests = await this.prisma.interest.findMany({
      include: { _count: { select: { profiles: true } } },
    });

    return interests
      .map((interest) => ({ name: interest.name, profileCount: interest._count.profiles }))
      .sort((a, b) => b.profileCount - a.profileCount);
  }

  async setMine(profileId: string, names: string[]) {
    const cleaned = Array.from(new Set(names.map((name) => name.trim()).filter(Boolean))).slice(0, 12);

    const interests = await Promise.all(
      cleaned.map((name) => this.prisma.interest.upsert({ where: { name }, update: {}, create: { name } }))
    );

    await this.prisma.$transaction([
      this.prisma.profileInterest.deleteMany({ where: { profileId } }),
      ...interests.map((interest) =>
        this.prisma.profileInterest.create({ data: { profileId, interestId: interest.id } })
      ),
    ]);

    return cleaned;
  }
}
