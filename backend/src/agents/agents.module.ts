import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Agency } from '../agencies/entities/agency.entity';
import { User } from '../auth/entities/user.entity';
import { EmailModule } from '../shared/email/email.module';
import { Agent } from './entities/agent.entity';
import { AgentsController } from './agents.controller';
import { AgentsService } from './agents.service';

@Module({
  imports: [TypeOrmModule.forFeature([Agent, Agency, User]), EmailModule],
  providers: [AgentsService],
  controllers: [AgentsController],
  exports: [AgentsService],
})
export class AgentsModule {}
