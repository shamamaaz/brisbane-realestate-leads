export interface Agency {
  id?: number;
  name: string;
  email: string;
  phone: string;
  address?: string;
  primaryColor?: string;
  secondaryColor?: string;
  createdAt?: Date;
  updatedAt?: Date;
}
