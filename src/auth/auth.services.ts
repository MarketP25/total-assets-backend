import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { Role } from '../common/enums/role.enum';
import { AuditService } from '../audit/audit.service';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private auditService: AuditService,
  ) {}

  async register(dto: RegisterDto) {
    const existing = await this.usersService.findByEmail(dto.email);
    if (existing) {
      throw new UnauthorizedException('Email already in use');
    }

    const passwordHash = await bcrypt.hash(dto.password, 10);
    const user = await this.usersService.create({
      email: dto.email,
      passwordHash,
      firstName: dto.firstName,
      lastName: dto.lastName,
      country: dto.country,
      role: Role.USER,
    });

    await this.auditService.log({
      actorId: user.id,
      actorRole: Role.USER,
      action: 'USER_REGISTER',
      entityType: 'USER',
      entityId: user.id,
      metadata: { email: user.email },
    });

    const token = await this.signToken(user.id, user.email, user.role);
    return { user, token };
  }

  async login(dto: LoginDto, ip?: string, userAgent?: string) {
    const user = await this.usersService.findByEmail(dto.email);
    if (!user) throw new UnauthorizedException('Invalid credentials');

    const match = await bcrypt.compare(dto.password, user.passwordHash);
    if (!match) throw new UnauthorizedException('Invalid credentials');

    await this.usersService.updateLoginInfo(user.id, ip);

    await this.auditService.log({
      actorId: user.id,
      actorRole: user.role,
      action: 'USER_LOGIN',
      entityType: 'USER',
      entityId: user.id,
      metadata: { email: user.email },
      ipAddress: ip ?? null,
      userAgent: userAgent ?? null,
    });

    const token = await this.signToken(user.id, user.email, user.role);
    return { user, token };
  }

  private async signToken(sub: string, email: string, role: Role) {
    const payload = { sub, email, role };
    return this.jwtService.signAsync(payload, {
      expiresIn: '1d',
    });
  }
}
