import { Body, Controller, Get, Param, Post, Query, Req, UseGuards } from '@nestjs/common';
import { DiscussionsService } from './discussions.service';
import { CreateDiscussionDto } from './dto/create-discussion.dto';
import { CreateReplyDto } from './dto/create-reply.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('discussions')
export class DiscussionsController {
  constructor(private readonly discussionsService: DiscussionsService) {}

  @Get()
  async findAll(@Query('limit') limit?: string, @Query('interest') interest?: string) {
    const parsed = limit ? parseInt(limit, 10) : 10;
    return this.discussionsService.findAll(Number.isFinite(parsed) ? parsed : 10, interest);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.discussionsService.findOne(id);
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  async create(@Req() req: any, @Body() dto: CreateDiscussionDto) {
    return this.discussionsService.create(req.user.id, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/replies')
  async reply(@Param('id') id: string, @Req() req: any, @Body() dto: CreateReplyDto) {
    return this.discussionsService.reply(id, req.user.id, dto.content);
  }
}
