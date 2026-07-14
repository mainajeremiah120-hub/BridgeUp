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
exports.SkillsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let SkillsService = class SkillsService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findMine(userId) {
        const userSkills = await this.prisma.userSkill.findMany({
            where: { userId },
            include: { skill: true },
        });
        return {
            teach: userSkills.filter((s) => s.type === 'teach').map((s) => s.skill.name),
            learn: userSkills.filter((s) => s.type === 'learn').map((s) => s.skill.name),
        };
    }
    async setMine(userId, teach, learn) {
        const clean = (names) => Array.from(new Set(names.map((name) => name.trim()).filter(Boolean))).slice(0, 12);
        const cleanTeach = clean(teach);
        const cleanLearn = clean(learn);
        const upsertSkills = async (names) => Promise.all(names.map((name) => this.prisma.skill.upsert({ where: { name }, update: {}, create: { name } })));
        const [teachSkills, learnSkills] = await Promise.all([
            upsertSkills(cleanTeach),
            upsertSkills(cleanLearn),
        ]);
        await this.prisma.$transaction([
            this.prisma.userSkill.deleteMany({ where: { userId } }),
            ...teachSkills.map((skill) => this.prisma.userSkill.create({ data: { userId, skillId: skill.id, type: 'teach' } })),
            ...learnSkills.map((skill) => this.prisma.userSkill.create({ data: { userId, skillId: skill.id, type: 'learn' } })),
        ]);
        return { teach: cleanTeach, learn: cleanLearn };
    }
};
exports.SkillsService = SkillsService;
exports.SkillsService = SkillsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], SkillsService);
//# sourceMappingURL=skills.service.js.map