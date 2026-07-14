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
exports.InterestsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let InterestsService = class InterestsService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findAll() {
        const interests = await this.prisma.interest.findMany({
            include: { _count: { select: { profiles: true } } },
        });
        return interests
            .map((interest) => ({ name: interest.name, profileCount: interest._count.profiles }))
            .sort((a, b) => b.profileCount - a.profileCount);
    }
    async setMine(profileId, names) {
        const cleaned = Array.from(new Set(names.map((name) => name.trim()).filter(Boolean))).slice(0, 12);
        const interests = await Promise.all(cleaned.map((name) => this.prisma.interest.upsert({ where: { name }, update: {}, create: { name } })));
        await this.prisma.$transaction([
            this.prisma.profileInterest.deleteMany({ where: { profileId } }),
            ...interests.map((interest) => this.prisma.profileInterest.create({ data: { profileId, interestId: interest.id } })),
        ]);
        return cleaned;
    }
};
exports.InterestsService = InterestsService;
exports.InterestsService = InterestsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], InterestsService);
//# sourceMappingURL=interests.service.js.map