import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcryptjs';
import { randomBytes } from 'crypto';
import { Repository } from 'typeorm';
import { Agency } from '../agencies/entities/agency.entity';
import { Agent } from '../agents/entities/agent.entity';
import { Lead } from '../leads/entities/lead.entity';
import { EmailService } from '../shared/email/email.service';
import { AuthResponseDto } from './dto/auth-response.dto';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { SellerLoginToken } from './entities/seller-login-token.entity';
import { User, UserRole } from './entities/user.entity';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepo: Repository<User>,
    @InjectRepository(Lead)
    private leadRepo: Repository<Lead>,
    @InjectRepository(Agency)
    private agencyRepo: Repository<Agency>,
    @InjectRepository(Agent)
    private agentRepo: Repository<Agent>,
    @InjectRepository(SellerLoginToken)
    private sellerTokenRepo: Repository<SellerLoginToken>,
    private jwtService: JwtService,
    private emailService: EmailService,
  ) {}

  async register(registerDto: RegisterDto): Promise<AuthResponseDto> {
    const { email, password, name, phone, role, agencyId, agencyName, primaryColor, secondaryColor } = registerDto;
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
    let resolvedAgencyId = agencyId;

    if (role === UserRole.AGENCY_ADMIN) {
      if (!agencyName) {
        throw new BadRequestException('Agency name is required.');
      }
      const agency = this.agencyRepo.create({
        name: agencyName,
        primaryColor: primaryColor || '#1f6b6f',
        secondaryColor: secondaryColor || '#fffaf3',
      });
      const savedAgency = await this.agencyRepo.save(agency);
      resolvedAgencyId = savedAgency.id;
    }

    if (role === UserRole.AGENT && !resolvedAgencyId) {
      throw new BadRequestException('Agent must belong to an agency.');
    }

    const user = this.userRepo.create({
      email,
      passwordHash,
      name,
      phone,
      role: role || UserRole.SELLER,
      agency: resolvedAgencyId ? { id: resolvedAgencyId } : undefined,
      agencyId: resolvedAgencyId,
    });

    const savedUser = await this.userRepo.save(user);
    await this.syncAgentUserLink(savedUser);
    console.log('✅ User registered:', { id: savedUser.id, email: savedUser.email, role: savedUser.role });

    await this.syncAgentUserLink(user);

    // Generate token
    const accessToken = this.jwtService.sign({
      id: savedUser.id,
      email: savedUser.email,
      role: savedUser.role,
      agencyId: savedUser.agencyId,
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
      agencyId: user.agencyId,
    });

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      accessToken,
    };
  }

  async loginOAuth(profile: { email?: string; name?: string; provider: string }): Promise<AuthResponseDto> {
    const { email, name } = profile;
    if (!email) {
      throw new BadRequestException('Email is required from OAuth provider.');
    }

    let user = await this.userRepo.findOne({ where: { email } });
    if (!user) {
      const salt = await bcrypt.genSalt();
      const passwordHash = await bcrypt.hash(`${email}:${Date.now()}`, salt);
      user = this.userRepo.create({
        email,
        name: name || email,
        role: UserRole.SELLER,
        passwordHash,
        isActive: true,
      });
      user = await this.userRepo.save(user);
    }

    if (!user.isActive) {
      throw new UnauthorizedException('User account is inactive');
    }

    await this.syncAgentUserLink(user);

    const accessToken = this.jwtService.sign({
      id: user.id,
      email: user.email,
      role: user.role,
      agencyId: user.agencyId,
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
    const user = await this.userRepo.findOne({ where: { id }, relations: ['agency'] });
    if (!user) {
      throw new BadRequestException('User not found');
    }
    await this.syncAgentUserLink(user);
    return user;
  }

  async seedDemoData() {
    let demoAgency = await this.agencyRepo.findOne({ where: { name: 'Lead Exchange Demo Agency' } });
    if (!demoAgency) {
      demoAgency = await this.agencyRepo.save(this.agencyRepo.create({
        name: 'Lead Exchange Demo Agency',
        primaryColor: '#1f6b6f',
        secondaryColor: '#fffaf3',
      }));
    }

    const demoUsers = [
      {
        email: 'admin@brisbaneleads.com',
        name: 'System Admin',
        role: UserRole.SYSTEM_ADMIN,
        password: 'Admin123!',
      },
      {
        email: 'agency@brisbaneleads.com',
        name: 'Agency Admin',
        role: UserRole.AGENCY_ADMIN,
        password: 'Agency123!',
        agencyId: demoAgency.id,
      },
      {
        email: 'agent@brisbaneleads.com',
        name: 'Lead Agent',
        role: UserRole.AGENT,
        password: 'Agent123!',
        agencyId: demoAgency.id,
      },
      {
        email: 'seller@brisbaneleads.com',
        name: 'Seller User',
        role: UserRole.SELLER,
        password: 'Seller123!',
      },
    ];

    for (const demo of demoUsers) {
      const existing = await this.userRepo.findOne({ where: { email: demo.email } });
      if (existing) {
        continue;
      }

      const salt = await bcrypt.genSalt();
      const passwordHash = await bcrypt.hash(demo.password, salt);
      const user = this.userRepo.create({
        email: demo.email,
        name: demo.name,
        role: demo.role,
        passwordHash,
        isActive: true,
        agency: demo.agencyId ? { id: demo.agencyId } : undefined,
        agencyId: demo.agencyId,
      });
      await this.userRepo.save(user);
    }

    const leadCount = await this.leadRepo.count();
    if (leadCount === 0) {
      const now = new Date();
      const leads = [
        this.leadRepo.create({
          homeownerName: 'John Doe',
          homeownerEmail: 'john@example.com',
          homeownerPhone: '0400 111 222',
          propertyAddress: '12 Maple St, Paddington QLD 4064',
          propertyType: 'house',
          preferredContactTime: '3PM - 5PM',
          status: 'New',
          createdAt: now,
          updatedAt: now,
        }),
        this.leadRepo.create({
          homeownerName: 'Lisa Smith',
          homeownerEmail: 'lisa@example.com',
          homeownerPhone: '0400 333 444',
          propertyAddress: '45 River Rd, New Farm QLD 4005',
          propertyType: 'apartment',
          preferredContactTime: '10AM - 12PM',
          status: 'Contacted',
          createdAt: now,
          updatedAt: now,
        }),
        this.leadRepo.create({
          homeownerName: 'Tom Brown',
          homeownerEmail: 'tom@example.com',
          homeownerPhone: '0400 555 666',
          propertyAddress: '78 Oak Ave, West End QLD 4101',
          propertyType: 'townhouse',
          preferredContactTime: 'Evenings 5-8PM',
          status: 'Scheduled',
          createdAt: now,
          updatedAt: now,
        }),
      ];
      await this.leadRepo.save(leads);
    }

    return demoUsers.map(({ password, ...rest }) => ({ ...rest, password }));
  }

  async createSellerMagicLink(email: string) {
    const normalized = email.toLowerCase();
    let user = await this.userRepo.findOne({ where: { email: normalized } });
    if (!user) {
      const salt = await bcrypt.genSalt();
      const passwordHash = await bcrypt.hash(`${normalized}:${Date.now()}`, salt);
      user = this.userRepo.create({
        email: normalized,
        name: normalized.split('@')[0],
        role: UserRole.SELLER,
        passwordHash,
        isActive: true,
      });
      user = await this.userRepo.save(user);
    }

    if (!user.isActive) {
      throw new UnauthorizedException('User account is inactive');
    }

    const token = randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 1000 * 60 * 30);
    const record = this.sellerTokenRepo.create({ token, user, expiresAt });
    await this.sellerTokenRepo.save(record);

    const webAppUrl = process.env.WEB_APP_URL || 'http://localhost:4200';
    const link = new URL('/seller/login', webAppUrl);
    link.searchParams.set('token', token);

    const magicLinkMode = (process.env.MAGIC_LINK_MODE || 'dev').toLowerCase();
    if (magicLinkMode === 'email') {
      if (!this.emailService.isConfigured()) {
        throw new BadRequestException('Email is not configured.');
      }
      await this.emailService.sendMagicLink(normalized, link.toString());
    } else {
      console.log(`🔗 Seller magic link for ${normalized}: ${link.toString()}`);
    }

    return { sent: true };
  }

  async verifySellerMagicLink(token: string): Promise<AuthResponseDto> {
    const record = await this.sellerTokenRepo.findOne({
      where: { token },
      relations: ['user'],
    });
    if (!record || record.usedAt) {
      throw new UnauthorizedException('Invalid or used magic link.');
    }
    if (record.expiresAt.getTime() < Date.now()) {
      throw new UnauthorizedException('Magic link has expired.');
    }

    record.usedAt = new Date();
    await this.sellerTokenRepo.save(record);

    const user = record.user;
    const accessToken = this.jwtService.sign({
      id: user.id,
      email: user.email,
      role: user.role,
      agencyId: user.agencyId,
    });

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      accessToken,
    };
  }

  private async syncAgentUserLink(user: User): Promise<void> {
    if (user.role !== UserRole.AGENT) {
      return;
    }

    const agent = await this.agentRepo.findOne({ where: { email: user.email } });
    if (!agent) {
      return;
    }

    if (agent.userId !== user.id) {
      agent.userId = user.id;
      await this.agentRepo.save(agent);
    }

    if (agent.id !== user.id) {
      await this.leadRepo.update(
        { assignedAgentId: agent.id },
        { assignedAgentId: user.id },
      );
    }
  }
}
