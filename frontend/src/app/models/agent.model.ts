export interface Agent {
  id?: number;
  name: string;
  email: string;
  phone: string;
  agencyId: number;
  territoryId: number;
  territory?: string;
  leadsAssigned?: number;
  role?: string;
  isActive?: boolean;
  userId?: number;
  createdAt?: Date;
  updatedAt?: Date;
}
