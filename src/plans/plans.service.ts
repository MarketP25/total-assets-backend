import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { InvestmentPlan } from './entities/investment-plan.entity';
import { RiskLevel } from '../common/enums/risk-level.enum';

@Injectable()
export class PlansService {
  constructor(
    @InjectRepository(InvestmentPlan)
    private readonly planRepo: Repository<InvestmentPlan>,
  ) {}

  async seedDefaultPlans() {
    const count = await this.planRepo.count();
    if (count > 0) return;

    const plans: Partial<InvestmentPlan>[] = [
      {
        code: 'PLAN1',
        name: 'Short-Term Yield Plan',
        description:
          '24-hour market-linked yield plan with target return between 5.3% and 5.8%.',
        minAmount: '20',
        maxAmount: '499',
        durationHours: 24,
        targetYieldMinPercent: '5.30',
        targetYieldMaxPercent: '5.80',
        riskLevel: RiskLevel.LOW,
        isActive: true,
      },
      {
        code: 'PLAN2',
        name: 'Enhanced 48-Hour Growth Plan',
        description:
          '48-hour diversified strategy with target return between 5.8% and 6.5%.',
        minAmount: '500',
        maxAmount: '999',
        durationHours: 48,
        targetYieldMinPercent: '5.80',
        targetYieldMaxPercent: '6.50',
        riskLevel: RiskLevel.MODERATE,
        isActive: true,
      },
      {
        code: 'PLAN3',
        name: '72-Hour Strategic Performance Plan',
        description:
          '72-hour active market strategy with target return between 6.5% and 8.5%.',
        minAmount: '1000',
        maxAmount: '4999',
        durationHours: 72,
        targetYieldMinPercent: '6.50',
        targetYieldMaxPercent: '8.50',
        riskLevel: RiskLevel.MODERATE,
        isActive: true,
      },
      {
        code: 'PLAN4',
        name: '5-Day High-Yield Portfolio',
        description:
          '5-day multi-asset portfolio with target return between 8% and 12%.',
        minAmount: '5000',
        maxAmount: null,
        durationHours: 120,
        targetYieldMinPercent: '8.00',
        targetYieldMaxPercent: '12.00',
        riskLevel: RiskLevel.HIGH,
        isActive: true,
      },
    ];

    await this.planRepo.save(plans);
  }

  findAllActive() {
    return this.planRepo.find({ where: { isActive: true } });
  }

  findAll() {
    return this.planRepo.find();
  }

  findOne(id: string) {
    return this.planRepo.findOne({ where: { id } });
  }
}
