import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Investment } from './entities/investment.entity';
import { InvestmentPlan } from '../plans/entities/investment-plan.entity';
import { InvestmentsService } from './investments.service';
import { InvestmentsController } from './investments.controller';
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
