import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Agent } from '../agents/entities/agent.entity';
import { LeadAssignment } from './entities/lead-assignment.entity';
import { LeadAssignmentsService } from './lead-assignments.service';

@Module({
  imports: [TypeOrmModule.forFeature([LeadAssignment, Agent])],
  providers: [LeadAssignmentsService],
  exports: [LeadAssignmentsService],
})
export class LeadAssignmentsModule {}
