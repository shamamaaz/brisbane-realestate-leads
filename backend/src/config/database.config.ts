import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { Agent } from '../agents/entities/agent.entity';
import { Agency } from '../agencies/entities/agency.entity';
import { Lead } from '../leads/entities/lead.entity';
import { Territory } from '../territories/entities/territory.entity';
import { LeadAssignment } from '../lead-assignments/entities/lead-assignment.entity';
import { User } from '../auth/entities/user.entity';

export const getDatabaseConfig = (): TypeOrmModuleOptions => {
  return {
    type: 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    username: process.env.DB_USERNAME || 'brisbane_user',
    password: process.env.DB_PASSWORD || 'vaseem@123',
    database: process.env.DB_DATABASE || 'brisbane_realestate_leads',
    entities: [Lead, Agency, Agent, Territory, LeadAssignment, User],
    synchronize: process.env.NODE_ENV !== 'production',
    logging: process.env.NODE_ENV !== 'production',
    dropSchema: false,
  };
};
