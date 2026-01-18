import { UserRole } from '../entities/user.entity';

export class RegisterDto {
  email: string;
  password: string;
  name: string;
  phone?: string;
  role?: UserRole;
  agencyId?: number;
}
