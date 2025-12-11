import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { UsersModule } from '../users/users.module';
import { WalletsModule } from '../wallets/wallets.module';
import { RolesGuard } from '../common/guards/roles.guard';
import { APP_GUARD } from '@nestjs/core';

@Module({
  imports: [UsersModule, WalletsModule],
  controllers: [AdminController],
  providers: [
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
  ],
})
export class AdminModule {}