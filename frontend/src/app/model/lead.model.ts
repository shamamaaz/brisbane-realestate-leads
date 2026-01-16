export interface Lead {
  id?: number;           // optional because it’s assigned by backend
  name: string;
  email: string;
  phone: string;
  suburb: string;
  propertyValue?: number; // optional
  createdAt?: string;     // optional, assigned by backend
}
