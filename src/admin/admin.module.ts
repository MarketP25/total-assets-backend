import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { UsersModule } from '../users/users.module';
import { WalletsModule } from '../wallets/wallets.module';
import { RolesGuard } from '../common/guard/roles.guard';
import { APP_GUARD } from '@nestjs/core';
import { AuditModule } from '../audit/audit.module';

@Module({
  imports: [UsersModule, WalletsModule, AuditModule],
  controllers: [AdminController],
  providers: [
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
  ],
})
export class AdminModule {}
