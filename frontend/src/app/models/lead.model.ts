export interface Lead {
  id?: number;
  homeownerName: string;
  homeownerEmail: string;
  homeownerPhone: string;
  propertyAddress: string;
  propertyType?: string; // house, apartment, unit, etc.
  preferredAgency?: string;
  preferredContactTime?: string;
  status?: string; // New, Contacted, Scheduled, Closed
  territoryId?: number;
  agencyId?: number;
  createdAt?: Date;
  updatedAt?: Date;
}
