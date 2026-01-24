import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LeadAssignmentsModule } from '../lead-assignments/lead-assignments.module';
import { Agent } from '../agents/entities/agent.entity';
import { User } from '../auth/entities/user.entity';
import { Lead } from './entities/lead.entity';
import { LeadsController } from './leads.controller';
import { LeadsService } from './leads.service';

@Module({
  imports: [TypeOrmModule.forFeature([Lead, Agent, User]), LeadAssignmentsModule],
  providers: [LeadsService],
  controllers: [LeadsController],
  exports: [LeadsService],
})
export class LeadsModule {}
