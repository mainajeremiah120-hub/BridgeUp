import { Controller, Get, Put, Body, Param, Query, UseGuards, Req } from '@nestjs/common';
import { ProfilesService } from './profiles.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('profiles')
export class ProfilesController {
  constructor(private readonly profilesService: ProfilesService) {}

  @Get('discover')
  async discover(@Query('limit') limit?: string) {
    const parsed = limit ? parseInt(limit, 10) : 6;
    return this.profilesService.discover(Number.isFinite(parsed) ? parsed : 6);
  }

  @Get(':userId')
  async getProfile(@Param('userId') userId: string) {
    return this.profilesService.findOne(userId);
  }

  @UseGuards(JwtAuthGuard)
  @Put()
  async updateProfile(@Req() req: any, @Body() updateProfileDto: UpdateProfileDto) {
    return this.profilesService.update(req.user.id, updateProfileDto);
  }
}
