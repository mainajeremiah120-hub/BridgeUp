import { Controller, Get, Post, Delete, Param, Query, UseGuards, Req } from '@nestjs/common';
import { CommunitiesService } from './communities.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('communities')
export class CommunitiesController {
  constructor(private readonly communitiesService: CommunitiesService) {}

  @Get()
  async getCommunities(@Query('parentId') parentId?: string) {
    if (parentId) {
      return this.communitiesService.findSubCommunities(parentId);
    }
    return this.communitiesService.findRootCommunities();
  }

  @Get('tree')
  async getCommunityTree() {
    return this.communitiesService.getCommunityTree();
  }

  @UseGuards(JwtAuthGuard)
  @Get('my')
  async getMyCommunities(@Req() req: any) {
    return this.communitiesService.findMyCommunities(req.user.id);
  }

  @Get(':id')
  async getCommunityDetails(@Param('id') id: string) {
    return this.communitiesService.findOne(id);
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/join')
  async joinCommunity(@Param('id') id: string, @Req() req: any) {
    return this.communitiesService.joinCommunity(req.user.id, id);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id/leave')
  async leaveCommunity(@Param('id') id: string, @Req() req: any) {
    return this.communitiesService.leaveCommunity(req.user.id, id);
  }
}
