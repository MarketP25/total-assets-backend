import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { InvestmentStatus } from '../common/enums/investment-status.enum';
import { Investment } from '../investments/entities/investment.entity';
import { Wallet } from '../wallets/entities/wallet.entity';
import { DashboardOverviewDto } from './dto/dashboard-overview.dto';

@Injectable()
export class DashboardService {
  constructor(
    @InjectRepository(Investment)
    private investmentRepo: Repository<Investment>,
    @InjectRepository(Wallet)
    private walletRepo: Repository<Wallet>,
  ) {}

  async getOverview(userId: string): Promise<DashboardOverviewDto> {
    const wallets = await this.walletRepo.find({ where: { userId } });
    const walletBalance = wallets.reduce(
      (sum, w) => sum + parseFloat(w.balance || '0'),
      0.0,
    );

    const activeInvestments = await this.investmentRepo.count({
      where: { userId, status: InvestmentStatus.ACTIVE },
    });

    const completedInvestments = await this.investmentRepo.find({
      where: { 
        userId, 
        status: InvestmentStatus.COMPLETED 
      },
      select: ['actualPayoutAmount', 'expectedPayoutAmount'],
    });
    const totalEarnings = completedInvestments.reduce(
      (sum, inv) => {
        const payout = parseFloat(
          inv.actualPayoutAmount || inv.expectedPayoutAmount || '0',
        );
        return sum + payout;
      }, 0.0
    );

    return {
      walletBalance: walletBalance.toFixed(2),
      activeInvestments,
      totalEarnings: totalEarnings.toFixed(2),
    };
  }
}
