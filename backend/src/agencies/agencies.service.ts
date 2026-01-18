import { Injectable } from '@nestjs/common';
import { AGENCIES_SEED } from '../shared/data/agencies-seed';

@Injectable()
export class AgenciesService {
  // In-memory storage (in production, this would be a database)
  private agencies = AGENCIES_SEED;

  getAllAgencies() {
    return this.agencies;
  }

  getAgencyById(id: number) {
    return this.agencies.find(agency => agency.id === id);
  }

  /**
   * Find agencies by postcode
   * Returns agencies that cover the specified postcode
   */
  findAgenciesByPostcode(postcode: string) {
    return this.agencies.filter(agency => 
      agency.postcodes.includes(postcode)
    );
  }

  /**
   * Find nearest agency (for cases where exact postcode match not found)
   */
  findNearestAgency() {
    return this.agencies[Math.floor(Math.random() * this.agencies.length)];
  }
}
