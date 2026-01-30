import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Lead } from '../leads/entities/lead.entity';
import { EmailService } from '../shared/email/email.service';
import { CreateAgentOfferDto } from './dto/create-agent-offer.dto';
import { AgentOffer } from './entities/agent-offer.entity';

@Injectable()
export class AgentOffersService {
  constructor(
    @InjectRepository(AgentOffer)
    private readonly offerRepo: Repository<AgentOffer>,
    @InjectRepository(Lead)
    private readonly leadRepo: Repository<Lead>,
    private readonly emailService: EmailService,
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

    const saved = await this.offerRepo.save(offer);

    if (lead.homeownerEmail && this.emailService.isConfigured()) {
      const webAppUrl = process.env.WEB_APP_URL || 'http://localhost:4200';
      const loginUrl = new URL('/auth/login', webAppUrl);
      await this.emailService.sendOfferNotification(lead.homeownerEmail, loginUrl.toString());
    }

    return saved;
  }

  async getOffersByLead(leadId: number): Promise<AgentOffer[]> {
    return this.offerRepo.find({
      where: { lead: { id: leadId } },
      order: { createdAt: 'DESC' },
    });
  }
}
