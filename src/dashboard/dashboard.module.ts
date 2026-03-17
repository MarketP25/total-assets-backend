import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';
import { Investment } from '../investments/entities/investment.entity';
import { Wallet } from '../wallets/entities/wallet.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Investment, Wallet])],
  controllers: [DashboardController],
  providers: [DashboardService],
  exports: [DashboardService],
})
export class DashboardModule {}
