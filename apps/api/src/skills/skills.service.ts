import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SkillsService {
  constructor(private prisma: PrismaService) {}

  async findMine(userId: string) {
    const userSkills = await this.prisma.userSkill.findMany({
      where: { userId },
      include: { skill: true },
    });

    return {
      teach: userSkills.filter((s) => s.type === 'teach').map((s) => s.skill.name),
      learn: userSkills.filter((s) => s.type === 'learn').map((s) => s.skill.name),
    };
  }

  async setMine(userId: string, teach: string[], learn: string[]) {
    const clean = (names: string[]) =>
      Array.from(new Set(names.map((name) => name.trim()).filter(Boolean))).slice(0, 12);

    const cleanTeach = clean(teach);
    const cleanLearn = clean(learn);

    const upsertSkills = async (names: string[]) =>
      Promise.all(
        names.map((name) => this.prisma.skill.upsert({ where: { name }, update: {}, create: { name } }))
      );

    const [teachSkills, learnSkills] = await Promise.all([
      upsertSkills(cleanTeach),
      upsertSkills(cleanLearn),
    ]);

    await this.prisma.$transaction([
      this.prisma.userSkill.deleteMany({ where: { userId } }),
      ...teachSkills.map((skill) =>
        this.prisma.userSkill.create({ data: { userId, skillId: skill.id, type: 'teach' } })
      ),
      ...learnSkills.map((skill) =>
        this.prisma.userSkill.create({ data: { userId, skillId: skill.id, type: 'learn' } })
      ),
    ]);

    return { teach: cleanTeach, learn: cleanLearn };
  }
}
