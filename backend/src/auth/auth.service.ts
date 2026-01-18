import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcryptjs';
import { Repository } from 'typeorm';
import { AuthResponseDto } from './dto/auth-response.dto';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { User, UserRole } from './entities/user.entity';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepo: Repository<User>,
    private jwtService: JwtService,
  ) {}

  async register(registerDto: RegisterDto): Promise<AuthResponseDto> {
    const { email, password, name, phone, role, agencyId } = registerDto;

    // Check if user already exists
    const existingUser = await this.userRepo.findOne({ where: { email } });
    if (existingUser) {
      throw new BadRequestException('Email already registered');
    }

    // Hash password
    const salt = await bcrypt.genSalt();
    const passwordHash = await bcrypt.hash(password, salt);

    // Create user
    const user = this.userRepo.create({
      email,
      passwordHash,
      name,
      phone,
      role: role || UserRole.HOMEOWNER,
      agency: agencyId ? { id: agencyId } : undefined,
    });

    const savedUser = await this.userRepo.save(user);

    // Generate token
    const accessToken = this.jwtService.sign({
      id: savedUser.id,
      email: savedUser.email,
      role: savedUser.role,
    });

    return {
      id: savedUser.id,
      email: savedUser.email,
      name: savedUser.name,
      role: savedUser.role,
      accessToken,
    };
  }

  async login(loginDto: LoginDto): Promise<AuthResponseDto> {
    const { email, password } = loginDto;

    // Find user
    const user = await this.userRepo.findOne({ where: { email } });
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Check if user is active
    if (!user.isActive) {
      throw new UnauthorizedException('User account is inactive');
    }

    // Generate token
    const accessToken = this.jwtService.sign({
      id: user.id,
      email: user.email,
      role: user.role,
    });

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      accessToken,
    };
  }

  async validateToken(token: string): Promise<any> {
    try {
      return this.jwtService.verify(token);
    } catch (error) {
      throw new UnauthorizedException('Invalid token');
    }
  }

  async getUserById(id: number): Promise<User> {
    const user = await this.userRepo.findOne({ where: { id } });
    if (!user) {
      throw new BadRequestException('User not found');
    }
    return user;
  }
}
