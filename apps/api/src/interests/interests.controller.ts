import { Body, Controller, Get, Put, Req, UseGuards } from '@nestjs/common';
import { InterestsService } from './interests.service';
import { SetInterestsDto } from './dto/set-interests.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('interests')
export class InterestsController {
  constructor(private readonly interestsService: InterestsService) {}

  @Get()
  async findAll() {
    return this.interestsService.findAll();
  }

  @UseGuards(JwtAuthGuard)
  @Put('mine')
  async setMine(@Req() req: any, @Body() dto: SetInterestsDto) {
    const interests = await this.interestsService.setMine(req.user.id, dto.names);
    return { interests };
  }
}
