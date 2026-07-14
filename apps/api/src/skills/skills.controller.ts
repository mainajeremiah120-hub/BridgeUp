import { Body, Controller, Get, Put, Req, UseGuards } from '@nestjs/common';
import { SkillsService } from './skills.service';
import { SetSkillsDto } from './dto/set-skills.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('skills')
export class SkillsController {
  constructor(private readonly skillsService: SkillsService) {}

  @UseGuards(JwtAuthGuard)
  @Get('mine')
  async findMine(@Req() req: any) {
    return this.skillsService.findMine(req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Put('mine')
  async setMine(@Req() req: any, @Body() dto: SetSkillsDto) {
    return this.skillsService.setMine(req.user.id, dto.teach, dto.learn);
  }
}
