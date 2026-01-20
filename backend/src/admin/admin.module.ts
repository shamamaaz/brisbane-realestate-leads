import { Module } from '@nestjs/common';
import { AgenciesModule } from '../agencies/agencies.module';
import { AgentsModule } from '../agents/agents.module';
import { LeadsModule } from '../leads/leads.module';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';

@Module({
  imports: [LeadsModule, AgenciesModule, AgentsModule],
  providers: [AdminService],
  controllers: [AdminController],
})
export class AdminModule {}
