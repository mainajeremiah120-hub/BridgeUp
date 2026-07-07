import { Body, Controller, Get, Param, Post, Query, Req, UseGuards } from '@nestjs/common';
import { EventsService } from './events.service';
import { CreateEventDto } from './dto/create-event.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('events')
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  @Get()
  async findAll(@Query('upcoming') upcoming?: string, @Query('limit') limit?: string) {
    const parsed = limit ? parseInt(limit, 10) : 10;
    return this.eventsService.findAll(upcoming !== 'false', Number.isFinite(parsed) ? parsed : 10);
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  async create(@Req() req: any, @Body() dto: CreateEventDto) {
    return this.eventsService.create(req.user.id, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/rsvp')
  async rsvp(@Param('id') id: string, @Req() req: any) {
    return this.eventsService.toggleRsvp(id, req.user.id);
  }
}
