export class CreateLeadDto {
  homeownerName: string;
  homeownerEmail: string;
  homeownerPhone: string;
  propertyAddress: string;
  propertyType?: string;
  preferredAgency?: string;
  preferredContactTime?: string;
  territoryId?: number;
  agencyId?: number;
}
