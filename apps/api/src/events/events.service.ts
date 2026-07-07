import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class EventsService {
  constructor(private prisma: PrismaService) {}

  async findAll(upcomingOnly = true, limit = 10) {
    const events = await this.prisma.event.findMany({
      where: upcomingOnly ? { startsAt: { gte: new Date() } } : undefined,
      orderBy: { startsAt: 'asc' },
      take: limit,
      include: {
        host: { include: { profile: true } },
        community: true,
        _count: { select: { rsvps: true } },
      },
    });

    return events.map((event) => this.mapEvent(event));
  }

  async create(
    hostId: string,
    dto: { title: string; description?: string; interestTag?: string; communityId?: string; startsAt: string }
  ) {
    return this.prisma.event.create({
      data: { ...dto, hostId, startsAt: new Date(dto.startsAt) },
    });
  }

  async toggleRsvp(eventId: string, userId: string) {
    const event = await this.prisma.event.findUnique({ where: { id: eventId } });
    if (!event) {
      throw new NotFoundException('Event not found');
    }

    const existing = await this.prisma.eventRsvp.findUnique({
      where: { userId_eventId: { userId, eventId } },
    });

    if (existing) {
      await this.prisma.eventRsvp.delete({ where: { userId_eventId: { userId, eventId } } });
    } else {
      await this.prisma.eventRsvp.create({ data: { userId, eventId } });
    }

    const count = await this.prisma.eventRsvp.count({ where: { eventId } });
    return { rsvped: !existing, count };
  }

  private mapEvent(event: any) {
    return {
      id: event.id,
      title: event.title,
      description: event.description,
      interestTag: event.interestTag,
      communityName: event.community?.name ?? null,
      hostName: event.host?.profile?.fullName || 'BridgeUp',
      startsAt: event.startsAt,
      rsvpCount: event._count ? event._count.rsvps : 0,
    };
  }
}
