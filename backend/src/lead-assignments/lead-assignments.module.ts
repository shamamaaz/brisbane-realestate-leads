import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Agent } from '../agents/entities/agent.entity';
import { Agency } from '../agencies/entities/agency.entity';
import { User } from '../auth/entities/user.entity';
import { Lead } from '../leads/entities/lead.entity';
import { LeadAssignment } from './entities/lead-assignment.entity';
import { LeadAssignmentsService } from './lead-assignments.service';

@Module({
  imports: [TypeOrmModule.forFeature([LeadAssignment, Lead, Agent, Agency, User])],
  providers: [LeadAssignmentsService],
  exports: [LeadAssignmentsService],
})
export class LeadAssignmentsModule {}
