import { Injectable } from '@nestjs/common';
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

  /**
   * Find agencies by postcode
   * Returns agencies that cover the specified postcode
   */
  findAgenciesByPostcode(postcode: string) {
    return AGENCIES_SEED.filter(agency => 
      agency.postcodes.includes(postcode)
    );
  }

  /**
   * Find nearest agency (for cases where exact postcode match not found)
   */
  findNearestAgency() {
    return AGENCIES_SEED[Math.floor(Math.random() * AGENCIES_SEED.length)];
  }
}
