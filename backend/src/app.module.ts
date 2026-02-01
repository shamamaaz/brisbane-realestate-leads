import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AgenciesModule } from './agencies/agencies.module';
import { AgentsModule } from './agents/agents.module';
import { AdminModule } from './admin/admin.module';
import { AgentOffersModule } from './agent-offers/agent-offers.module';
import { AuthModule } from './auth/auth.module';
import { getDatabaseConfig } from './config/database.config';
import { LeadAssignmentsModule } from './lead-assignments/lead-assignments.module';
import { LeadScoresModule } from './lead-scores/lead-scores.module';
import { LeadsModule } from './leads/leads.module';
import { TerritoriesModule } from './territories/territories.module';
import { UploadBatchesModule } from './upload-batches/upload-batches.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: [
        `.env.${process.env.NODE_ENV || 'local'}`,
        '.env.local',
        '.env.production',
        '.env',
      ],
    }),
    TypeOrmModule.forRoot(getDatabaseConfig()),
    AuthModule,
    LeadsModule,
    AgentOffersModule,
    AgenciesModule,
    AgentsModule,
    AdminModule,
    TerritoriesModule,
    LeadAssignmentsModule,
    UploadBatchesModule,
    LeadScoresModule,
  ],
})
export class AppModule {}
