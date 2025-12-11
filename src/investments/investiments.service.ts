import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThanOrEqual } from 'typeorm';
import { Investment } from './entities/investment.entity';
import { InvestmentPlan } from '../plans/entities/investment-plan.entity';
import { WalletsService } from '../wallets/wallets.service';
import { InvestmentStatus } from '../common/enums/investment-status.enum';
import { CreateInvestmentDto } from './dto/create-investment.dto';

@Injectable()
export class InvestmentsService {
  constructor(
    @InjectRepository(Investment)
    private readonly investmentRepo: Repository<Investment>,
    @InjectRepository(InvestmentPlan)
    private readonly planRepo: Repository<InvestmentPlan>,
    private readonly walletsService: WalletsService,
  ) {}

  async create(userId: string, dto: CreateInvestmentDto) {
    const plan = await this.planRepo.findOne({ where: { id: dto.planId } });
    if (!plan || !plan.isActive) {
      throw new NotFoundException('Plan not found or inactive');
    }

    const amount = Number(dto.amount);
    const min = Number(plan.minAmount);
    const max = plan.maxAmount ? Number(plan.maxAmount) : null;

    if (amount < min) {
      throw new BadRequestException(`Minimum amount is ${min}`);
    }
    if (max !== null && amount > max) {
      throw new BadRequestException(`Maximum amount is ${max}`);
    }

    const { transactionId } = await this.walletsService.fundInvestment(
      userId,
      amount,
      'USDT',
    );

    const minYield = Number(plan.targetYieldMinPercent);
    const maxYield = Number(plan.targetYieldMaxPercent);
    const expectedYieldPercent =
      minYield + Math.random() * (maxYield - minYield);
    const expectedPayoutAmount = amount * (1 + expectedYieldPercent / 100);

    const now = new Date();
    const endTime = new Date(
      now.getTime() + plan.durationHours * 3600 * 1000,
    );

    const investment = this.investmentRepo.create({
      userId,
      planId: plan.id,
      amountInvested: amount.toFixed(2),
      expectedYieldPercent: expectedYieldPercent.toFixed(2),
      expectedPayoutAmount: expectedPayoutAmount.toFixed(2),
      status: InvestmentStatus.ACTIVE,
      fundedTransactionId: transactionId,
      startTime: now,
      endTime,
    });

    return this.investmentRepo.save(investment);
  }

  async findForUser(userId: string) {
    return this.investmentRepo.find({
      where: { userId },
      relations: ['plan'],
      order: { createdAt: 'DESC' },
    });
  }

  async findMatured(now: Date) {
    return this.investmentRepo.find({
      where: {
        status: InvestmentStatus.ACTIVE,
        endTime: LessThanOrEqual(now),
      } as any,
    });
  }

  async markCompleted(
    investment: Investment,
    actualYieldPercent: number,
    actualPayoutAmount: number,
    payoutTransactionId: string,
  ) {
    investment.actualYieldPercent = actualYieldPercent.toFixed(2);
    investment.actualPayoutAmount = actualPayoutAmount.toFixed(2);
    investment.payoutTransactionId = payoutTransactionId;
    investment.status = InvestmentStatus.COMPLETED;
    return this.investmentRepo.save(investment);
  }
}