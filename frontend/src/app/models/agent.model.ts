export interface Agent {
  id?: number;
  name: string;
  email: string;
  phone: string;
  agencyId: number;
  territoryId: number;
  territory?: string;
  leadsAssigned?: number;
  createdAt?: Date;
  updatedAt?: Date;
}
