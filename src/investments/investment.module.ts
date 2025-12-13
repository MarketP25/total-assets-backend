import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Investment } from './entities/investment.entity';
import { InvestmentPlan } from './plans/entities/investment-plan.entity';
import { InvestmentsService } from './investment.service';
import { InvestmentsController } from './investment.controller';
import { WalletsModule } from '../wallets/wallets.module';
import { InvestmentsProcessor } from './investments.processor';

@Module({
  imports: [
    TypeOrmModule.forFeature([Investment, InvestmentPlan]),
    WalletsModule,
  ],
  providers: [InvestmentsService, InvestmentsProcessor],
  controllers: [InvestmentsController],
})
export class InvestmentsModule {}
