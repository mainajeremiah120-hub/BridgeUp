import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { CommunitiesModule } from './communities/communities.module';
import { ProfilesModule } from './profiles/profiles.module';
import { ChatModule } from './chat/chat.module';
import { InterestsModule } from './interests/interests.module';
import { DiscussionsModule } from './discussions/discussions.module';
import { EventsModule } from './events/events.module';
import { StatsModule } from './stats/stats.module';
import { SkillsModule } from './skills/skills.module';
import { AppController } from './app.controller';

@Module({
  imports: [
    PrismaModule,
    AuthModule,
    CommunitiesModule,
    ProfilesModule,
    ChatModule,
    InterestsModule,
    DiscussionsModule,
    EventsModule,
    StatsModule,
    SkillsModule,
  ],
  controllers: [AppController],
})
export class AppModule {}
