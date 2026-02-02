import { AgentOffer } from './agent-offer.model';

export interface Lead {
  id?: number;
  homeownerName: string;
  homeownerEmail: string;
  homeownerPhone: string;
  propertyAddress: string;
  streetAddress?: string;
  suburb?: string;
  state?: string;
  postcode?: string;
  latitude?: number;
  longitude?: number;
  addressPlaceId?: string;
  propertyType?: string; // house, apartment, unit, etc.
  preferredAgency?: string;
  preferredContactTime?: string;
  status?: string; // New, Contacted, Scheduled, Closed
  sourceType?: string;
  estimatedValue?: number;
  notes?: string;
  callHistory?: string[];
  followUpNotes?: string;
  nextFollowUpDate?: Date;
  lastContactedDate?: Date;
  assignedAgentName?: string;
  assignedAgentId?: number;
  createdByAgentId?: number;
  offers?: AgentOffer[];
  territoryId?: number;
  agencyId?: number;
  createdAt?: Date;
  updatedAt?: Date;
}
