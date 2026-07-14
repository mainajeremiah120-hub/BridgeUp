"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EventsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let EventsService = class EventsService {
    constructor(prisma) {
        this.prisma = prisma;
    }
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
    async create(hostId, dto) {
        return this.prisma.event.create({
            data: { ...dto, hostId, startsAt: new Date(dto.startsAt) },
        });
    }
    async toggleRsvp(eventId, userId) {
        const event = await this.prisma.event.findUnique({ where: { id: eventId } });
        if (!event) {
            throw new common_1.NotFoundException('Event not found');
        }
        const existing = await this.prisma.eventRsvp.findUnique({
            where: { userId_eventId: { userId, eventId } },
        });
        if (existing) {
            await this.prisma.eventRsvp.delete({ where: { userId_eventId: { userId, eventId } } });
        }
        else {
            await this.prisma.eventRsvp.create({ data: { userId, eventId } });
        }
        const count = await this.prisma.eventRsvp.count({ where: { eventId } });
        return { rsvped: !existing, count };
    }
    mapEvent(event) {
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
};
exports.EventsService = EventsService;
exports.EventsService = EventsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], EventsService);
//# sourceMappingURL=events.service.js.map