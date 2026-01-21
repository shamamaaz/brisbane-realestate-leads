export interface AgentOffer {
  id?: number;
  leadId?: number;
  agentName: string;
  agentEmail?: string;
  agencyName?: string;
  priceMin?: number;
  priceMax?: number;
  commissionPercent?: number;
  estimatedDays?: number;
  message?: string;
  createdAt?: Date;
}

export interface CreateAgentOffer {
  leadId: number;
  agentName: string;
  agentEmail?: string;
  agencyName?: string;
  priceMin?: number;
  priceMax?: number;
  commissionPercent?: number;
  estimatedDays?: number;
  message?: string;
}
