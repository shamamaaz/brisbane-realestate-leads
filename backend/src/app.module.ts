import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AgenciesModule } from './agencies/agencies.module';
import { AgentsModule } from './agents/agents.module';
import { AdminModule } from './admin/admin.module';
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
      envFilePath: '.env',
    }),
    TypeOrmModule.forRoot(getDatabaseConfig()),
    AuthModule,
    LeadsModule,
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
