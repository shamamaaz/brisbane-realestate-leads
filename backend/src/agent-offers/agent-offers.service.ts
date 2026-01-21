import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Lead } from '../leads/entities/lead.entity';
import { CreateAgentOfferDto } from './dto/create-agent-offer.dto';
import { AgentOffer } from './entities/agent-offer.entity';

@Injectable()
export class AgentOffersService {
  constructor(
    @InjectRepository(AgentOffer)
    private readonly offerRepo: Repository<AgentOffer>,
    @InjectRepository(Lead)
    private readonly leadRepo: Repository<Lead>,
  ) {}

  async createOffer(dto: CreateAgentOfferDto): Promise<AgentOffer> {
    const lead = await this.leadRepo.findOne({ where: { id: dto.leadId } });
    if (!lead) {
      throw new NotFoundException('Lead not found');
    }

    const offer = this.offerRepo.create({
      lead,
      agentName: dto.agentName,
      agentEmail: dto.agentEmail,
      agencyName: dto.agencyName,
      priceMin: dto.priceMin,
      priceMax: dto.priceMax,
      commissionPercent: dto.commissionPercent,
      estimatedDays: dto.estimatedDays,
      message: dto.message,
    });

    return this.offerRepo.save(offer);
  }

  async getOffersByLead(leadId: number): Promise<AgentOffer[]> {
    return this.offerRepo.find({
      where: { lead: { id: leadId } },
      order: { createdAt: 'DESC' },
    });
  }
}
