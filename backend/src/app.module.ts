import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Lead } from './leads/lead.entity';
import { LeadsModule } from './leads/leads.module';
import { AgenciesModule } from './agencies/agencies.module';
import { AgentsModule } from './agents/agents.module';
import { TerritoriesModule } from './territories/territories.module';
import { LeadAssignmentsModule } from './lead-assignments/lead-assignments.module';
import { UploadBatchesModule } from './upload-batches/upload-batches.module';
import { LeadScoresModule } from './lead-scores/lead-scores.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'brisbane_user',
      password: 'vaseem@123',
      database: 'brisbane_realestate_leads',
      entities: [Lead],
      synchronize: true,
    }),
    LeadsModule,
    AgenciesModule,
    AgentsModule,
    TerritoriesModule,
    LeadAssignmentsModule,
    UploadBatchesModule,
    LeadScoresModule, // ✅ must import the module
  ],
})
export class AppModule {}
