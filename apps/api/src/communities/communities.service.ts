import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CommunitiesService {
  constructor(private prisma: PrismaService) {}

  async findRootCommunities() {
    return this.prisma.community.findMany({
      where: { parentId: null },
      orderBy: { name: 'asc' },
    });
  }

  async findSubCommunities(parentId: string) {
    return this.prisma.community.findMany({
      where: { parentId },
      orderBy: { name: 'asc' },
    });
  }

  // Build recursive community tree structure (very useful for explorer sidebar/page)
  async getCommunityTree() {
    const allCommunities = await this.prisma.community.findMany({
      orderBy: { level: 'asc' },
    });

    const communityMap = new Map<string, any>();
    const roots: any[] = [];

    // Prepopulate map
    allCommunities.forEach((comm) => {
      communityMap.set(comm.id, { ...comm, children: [] });
    });

    // Build hierarchy
    allCommunities.forEach((comm) => {
      const mapped = communityMap.get(comm.id);
      if (comm.parentId) {
        const parent = communityMap.get(comm.parentId);
        if (parent) {
          parent.children.push(mapped);
        } else {
          // If parent not found, fallback to root
          roots.push(mapped);
        }
      } else {
        roots.push(mapped);
      }
    });

    return roots;
  }

  async findOne(id: string) {
    const community = await this.prisma.community.findUnique({
      where: { id },
      include: {
        channels: true,
      },
    });

    if (!community) {
      throw new NotFoundException('Community not found');
    }

    return community;
  }

  async joinCommunity(userId: string, communityId: string) {
    // Check if community exists
    const community = await this.prisma.community.findUnique({
      where: { id: communityId },
    });
    if (!community) {
      throw new NotFoundException('Community not found');
    }

    // Check if membership already exists
    const existing = await this.prisma.membership.findUnique({
      where: {
        userId_communityId: {
          userId,
          communityId,
        },
      },
    });

    if (existing) {
      throw new ConflictException('Already a member of this community');
    }

    // Join community
    return this.prisma.membership.create({
      data: {
        userId,
        communityId,
        role: 'member',
      },
    });
  }

  async leaveCommunity(userId: string, communityId: string) {
    const existing = await this.prisma.membership.findUnique({
      where: {
        userId_communityId: {
          userId,
          communityId,
        },
      },
    });

    if (!existing) {
      throw new NotFoundException('Membership not found');
    }

    return this.prisma.membership.delete({
      where: {
        userId_communityId: {
          userId,
          communityId,
        },
      },
    });
  }

  async findMyCommunities(userId: string) {
    const memberships = await this.prisma.membership.findMany({
      where: { userId },
      include: {
        community: true,
      },
    });

    return memberships.map((m) => m.community);
  }
}
