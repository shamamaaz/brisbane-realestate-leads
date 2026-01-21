import { AgentOffer } from './agent-offer.model';

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
  estimatedValue?: number;
  notes?: string;
  callHistory?: string[];
  followUpNotes?: string;
  nextFollowUpDate?: Date;
  lastContactedDate?: Date;
  assignedAgentName?: string;
  offers?: AgentOffer[];
  territoryId?: number;
  agencyId?: number;
  createdAt?: Date;
  updatedAt?: Date;
}
