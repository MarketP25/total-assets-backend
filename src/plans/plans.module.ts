import { Module, OnModuleInit } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InvestmentPlan } from './entities/investment-plan.entity';
import { PlansService } from './plans.service';
import { PlansController } from './plans.controller';

@Module({
  imports: [TypeOrmModule.forFeature([InvestmentPlan])],
  providers: [PlansService],
  controllers: [PlansController],
  exports: [PlansService],
})
export class PlansModule implements OnModuleInit {
  constructor(private readonly plansService: PlansService) {}

  async onModuleInit() {
    await this.plansService.seedDefaultPlans();
  }
}
