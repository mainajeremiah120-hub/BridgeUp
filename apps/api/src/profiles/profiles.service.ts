import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateProfileDto } from './dto/update-profile.dto';

@Injectable()
export class ProfilesService {
  constructor(private prisma: PrismaService) {}

  async findOne(userId: string) {
    const profile = await this.prisma.profile.findUnique({
      where: { id: userId },
      include: { interests: { include: { interest: true } } },
    });

    if (!profile) {
      throw new NotFoundException('Profile not found');
    }

    return this.mapProfile(profile);
  }

  async discover(limit = 6) {
    const profiles = await this.prisma.profile.findMany({
      orderBy: { createdAt: 'desc' },
      take: limit,
      include: { interests: { include: { interest: true } } },
    });

    return profiles.map((profile) => this.mapProfile(profile));
  }

  async update(userId: string, updateProfileDto: UpdateProfileDto) {
    // Check if profile exists
    await this.findOne(userId);

    return this.prisma.profile.update({
      where: { id: userId },
      data: updateProfileDto,
    });
  }

  private mapProfile(profile: any) {
    const { interests, ...rest } = profile;
    return {
      ...rest,
      interests: interests.map((profileInterest: any) => profileInterest.interest.name),
    };
  }
}
