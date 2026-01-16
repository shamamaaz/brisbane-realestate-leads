export interface Agent {
  id?: number;
  name: string;
  email: string;
  phone: string;
  agencyId: number;
  territoryId: number;
  createdAt?: Date;
  updatedAt?: Date;
}
