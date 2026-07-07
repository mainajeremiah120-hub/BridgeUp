import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ChatGateway } from '../chat/chat.gateway';

@Injectable()
export class StatsService {
  constructor(private prisma: PrismaService, private chatGateway: ChatGateway) {}

  async overview() {
    const [totalUsers, totalCommunities] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.community.count(),
    ]);

    return { totalUsers, totalCommunities, ...this.chatGateway.getStats() };
  }
}
