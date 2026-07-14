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
exports.CommunitiesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let CommunitiesService = class CommunitiesService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findRootCommunities() {
        const communities = await this.prisma.community.findMany({
            where: { parentId: null },
            orderBy: { name: 'asc' },
            include: { _count: { select: { memberships: true } } },
        });
        return communities.map(({ _count, ...community }) => ({
            ...community,
            memberCount: _count.memberships,
        }));
    }
    async findSubCommunities(parentId) {
        return this.prisma.community.findMany({
            where: { parentId },
            orderBy: { name: 'asc' },
        });
    }
    async getCommunityTree() {
        const allCommunities = await this.prisma.community.findMany({
            orderBy: { level: 'asc' },
        });
        const communityMap = new Map();
        const roots = [];
        allCommunities.forEach((comm) => {
            communityMap.set(comm.id, { ...comm, children: [] });
        });
        allCommunities.forEach((comm) => {
            const mapped = communityMap.get(comm.id);
            if (comm.parentId) {
                const parent = communityMap.get(comm.parentId);
                if (parent) {
                    parent.children.push(mapped);
                }
                else {
                    roots.push(mapped);
                }
            }
            else {
                roots.push(mapped);
            }
        });
        return roots;
    }
    async findOne(id) {
        const community = await this.prisma.community.findUnique({
            where: { id },
            include: {
                channels: true,
            },
        });
        if (!community) {
            throw new common_1.NotFoundException('Community not found');
        }
        return community;
    }
    async joinCommunity(userId, communityId) {
        const community = await this.prisma.community.findUnique({
            where: { id: communityId },
        });
        if (!community) {
            throw new common_1.NotFoundException('Community not found');
        }
        const existing = await this.prisma.membership.findUnique({
            where: {
                userId_communityId: {
                    userId,
                    communityId,
                },
            },
        });
        if (existing) {
            throw new common_1.ConflictException('Already a member of this community');
        }
        return this.prisma.membership.create({
            data: {
                userId,
                communityId,
                role: 'member',
            },
        });
    }
    async leaveCommunity(userId, communityId) {
        const existing = await this.prisma.membership.findUnique({
            where: {
                userId_communityId: {
                    userId,
                    communityId,
                },
            },
        });
        if (!existing) {
            throw new common_1.NotFoundException('Membership not found');
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
    async findMyCommunities(userId) {
        const memberships = await this.prisma.membership.findMany({
            where: { userId },
            include: {
                community: true,
            },
        });
        return memberships.map((m) => m.community);
    }
};
exports.CommunitiesService = CommunitiesService;
exports.CommunitiesService = CommunitiesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], CommunitiesService);
//# sourceMappingURL=communities.service.js.map