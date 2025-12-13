import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { WalletsModule } from '../wallets/wallets.module';

@Module({
  imports: [WalletsModule],
  controllers: [AdminController],
})
export class AdminModule {}
