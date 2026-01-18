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
    console.log('📝 Register attempt:', { email, name, role });

    // Check if user already exists
    const existingUser = await this.userRepo.findOne({ where: { email } });
    if (existingUser) {
      console.log('❌ Email already registered:', email);
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
    console.log('✅ User registered:', { id: savedUser.id, email: savedUser.email, role: savedUser.role });

    // Generate token
    const accessToken = this.jwtService.sign({
      id: savedUser.id,
      email: savedUser.email,
      role: savedUser.role,
    });
    console.log('🔑 Token generated for user:', savedUser.id);

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
    console.log('🔐 Login attempt:', email);

    // Find user
    const user = await this.userRepo.findOne({ where: { email } });
    if (!user) {
      console.log('❌ User not found:', email);
      throw new UnauthorizedException('Invalid credentials');
    }
    console.log('✅ User found:', { id: user.id, email, hasPassword: !!user.passwordHash });

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    console.log('🔑 Password valid:', isPasswordValid);
    if (!isPasswordValid) {
      console.log('❌ Password mismatch for user:', email);
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
