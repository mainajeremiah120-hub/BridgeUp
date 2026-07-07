import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class DiscussionsService {
  constructor(private prisma: PrismaService) {}

  async findAll(limit = 10, interestTag?: string) {
    const discussions = await this.prisma.discussion.findMany({
      where: interestTag ? { interestTag } : undefined,
      orderBy: { createdAt: 'desc' },
      take: limit,
      include: {
        author: { include: { profile: true } },
        community: true,
        _count: { select: { replies: true } },
      },
    });

    return discussions.map((discussion) => this.mapDiscussion(discussion));
  }

  async findOne(id: string) {
    const discussion = await this.prisma.discussion.findUnique({
      where: { id },
      include: {
        author: { include: { profile: true } },
        community: true,
        replies: {
          orderBy: { createdAt: 'asc' },
          include: { author: { include: { profile: true } } },
        },
      },
    });

    if (!discussion) {
      throw new NotFoundException('Discussion not found');
    }

    return {
      ...this.mapDiscussion(discussion),
      replies: discussion.replies.map((reply) => ({
        id: reply.id,
        content: reply.content,
        authorName: reply.author?.profile?.fullName || 'BridgeUp',
        createdAt: reply.createdAt,
      })),
    };
  }

  async create(
    authorId: string,
    dto: { title: string; body: string; interestTag?: string; communityId?: string }
  ) {
    return this.prisma.discussion.create({ data: { ...dto, authorId } });
  }

  async reply(discussionId: string, authorId: string, content: string) {
    const discussion = await this.prisma.discussion.findUnique({ where: { id: discussionId } });
    if (!discussion) {
      throw new NotFoundException('Discussion not found');
    }

    return this.prisma.discussionReply.create({ data: { discussionId, authorId, content } });
  }

  private mapDiscussion(discussion: any) {
    return {
      id: discussion.id,
      title: discussion.title,
      body: discussion.body,
      interestTag: discussion.interestTag,
      communityName: discussion.community?.name ?? null,
      authorName: discussion.author?.profile?.fullName || 'BridgeUp',
      replyCount: discussion._count ? discussion._count.replies : undefined,
      createdAt: discussion.createdAt,
    };
  }
}
