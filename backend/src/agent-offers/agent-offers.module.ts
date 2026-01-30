import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Lead } from '../leads/entities/lead.entity';
import { EmailModule } from '../shared/email/email.module';
import { AgentOffersController } from './agent-offers.controller';
import { AgentOffersService } from './agent-offers.service';
import { AgentOffer } from './entities/agent-offer.entity';

@Module({
  imports: [TypeOrmModule.forFeature([AgentOffer, Lead]), EmailModule],
  controllers: [AgentOffersController],
  providers: [AgentOffersService],
  exports: [AgentOffersService],
})
export class AgentOffersModule {}
