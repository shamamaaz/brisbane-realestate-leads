import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LeadAssignmentsModule } from '../lead-assignments/lead-assignments.module';
import { Lead } from './entities/lead.entity';
import { LeadsController } from './leads.controller';
import { LeadsService } from './leads.service';

@Module({
  imports: [TypeOrmModule.forFeature([Lead]), LeadAssignmentsModule],
  providers: [LeadsService],
  controllers: [LeadsController],
})
export class LeadsModule {}
