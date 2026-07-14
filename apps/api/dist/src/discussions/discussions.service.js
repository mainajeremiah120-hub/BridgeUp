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
exports.DiscussionsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let DiscussionsService = class DiscussionsService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findAll(limit = 10, interestTag) {
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
    async findOne(id) {
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
            throw new common_1.NotFoundException('Discussion not found');
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
    async create(authorId, dto) {
        return this.prisma.discussion.create({ data: { ...dto, authorId } });
    }
    async reply(discussionId, authorId, content) {
        const discussion = await this.prisma.discussion.findUnique({ where: { id: discussionId } });
        if (!discussion) {
            throw new common_1.NotFoundException('Discussion not found');
        }
        return this.prisma.discussionReply.create({ data: { discussionId, authorId, content } });
    }
    mapDiscussion(discussion) {
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
};
exports.DiscussionsService = DiscussionsService;
exports.DiscussionsService = DiscussionsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], DiscussionsService);
//# sourceMappingURL=discussions.service.js.map