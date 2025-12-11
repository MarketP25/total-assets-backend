import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { Role } from '../common/enums/role.enum';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) {}

  create(data: Partial<User>) {
    const user = this.userRepo.create(data);
    return this.userRepo.save(user);
  }

  findByEmail(email: string) {
    return this.userRepo.findOne({ where: { email } });
  }

  findById(id: string) {
    return this.userRepo.findOne({ where: { id } });
  }

  findAll() {
    return this.userRepo.find();
  }

  async updateLoginInfo(id: string, ip?: string) {
    await this.userRepo.update(id, {
      lastLoginAt: new Date(),
      lastLoginIp: ip ?? null,
    });
  }

  async ensureAdminExists() {
    const adminEmail = 'admin@totalassets.com';
    const existing = await this.findByEmail(adminEmail);
    if (!existing) {
      const bcrypt = await import('bcrypt');
      const passwordHash = await bcrypt.hash('Admin123!', 10);
      await this.create({
        email: adminEmail,
        passwordHash,
        role: Role.ADMIN,
      });
    }
  }
}