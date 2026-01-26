import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Agency } from './entities/agency.entity';
import { AGENCIES_SEED } from '../shared/data/agencies-seed';

@Injectable()
export class AgenciesService {
  constructor(
    @InjectRepository(Agency)
    private agencyRepo: Repository<Agency>,
  ) {}

  async getAllAgencies() {
    return this.agencyRepo.find();
  }

  async getAgencyById(id: number) {
    return this.agencyRepo.findOne({ where: { id } });
  }

  async updateAgency(id: number, payload: Partial<Agency>) {
    const agency = await this.agencyRepo.findOne({ where: { id } });
    if (!agency) {
      throw new NotFoundException('Agency not found');
    }

    Object.assign(agency, {
      primaryColor: payload.primaryColor ?? agency.primaryColor,
      secondaryColor: payload.secondaryColor ?? agency.secondaryColor,
      logoUrl: payload.logoUrl ?? agency.logoUrl,
      postcodes: Array.isArray(payload.postcodes) ? payload.postcodes : agency.postcodes,
      routingMode: payload.routingMode ?? agency.routingMode,
    });

    return this.agencyRepo.save(agency);
  }

  /**
   * Find agencies by postcode
   * Returns agencies that cover the specified postcode
   */
  findAgenciesByPostcode(postcode: string) {
    return this.agencyRepo
      .createQueryBuilder('agency')
      .where(':postcode = ANY(agency.postcodes)', { postcode })
      .getMany();
  }

  /**
   * Find nearest agency (for cases where exact postcode match not found)
   */
  findNearestAgency() {
    return this.agencyRepo.findOne({ order: { id: 'ASC' } });
  }
}
