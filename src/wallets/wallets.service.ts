import {
  Injectable,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Wallet } from './entities/wallet.entity';
import { Transaction } from './entities/transaction.entity';
import { TransactionType } from '../common/enums/transaction-type.enum';
import { TransactionStatus } from '../common/enums/transaction-status.enum';

@Injectable()
export class WalletsService {
  constructor(
    @InjectRepository(Wallet)
    private readonly walletRepo: Repository<Wallet>,
    @InjectRepository(Transaction)
    private readonly txRepo: Repository<Transaction>,
  ) {}

  async getUserWallet(userId: string, currency = 'USDT') {
    let wallet = await this.walletRepo.findOne({
      where: { userId, currency },
    });
    if (!wallet) {
      wallet = this.walletRepo.create({
        userId,
        currency,
        balanceAvailable: '0',
        balanceLocked: '0',
      });
      wallet = await this.walletRepo.save(wallet);
    }
    return wallet;
  }

  async creditWalletAdmin(
    adminId: string,
    userId: string,
    amount: number,
    currency = 'USDT',
  ) {
    const wallet = await this.getUserWallet(userId, currency);
    const bal = Number(wallet.balanceAvailable);
    wallet.balanceAvailable = (bal + amount).toFixed(8);

    await this.walletRepo.save(wallet);

    const tx = this.txRepo.create({
      userId,
      walletId: wallet.id,
      type: TransactionType.DEPOSIT,
      amount: amount.toFixed(8),
      currency,
      status: TransactionStatus.COMPLETED,
      referenceType: 'ADMIN',
      referenceId: adminId,
    });
    await this.txRepo.save(tx);

    return { wallet, transactionId: tx.id };
  }

  async fundInvestment(
    userId: string,
    amount: number,
    currency = 'USDT',
  ): Promise<{ transactionId: string }> {
    const wallet = await this.getUserWallet(userId, currency);
    const available = Number(wallet.balanceAvailable);

    if (available < amount) {
      throw new BadRequestException('Insufficient balance');
    }

    wallet.balanceAvailable = (available - amount).toFixed(8);
    const locked = Number(wallet.balanceLocked);
    wallet.balanceLocked = (locked + amount).toFixed(8);

    await this.walletRepo.save(wallet);

    const tx = this.txRepo.create({
      userId,
      walletId: wallet.id,
      type: TransactionType.INVESTMENT_FUND,
      amount: amount.toFixed(8),
      currency,
      status: TransactionStatus.COMPLETED,
    });

    await this.txRepo.save(tx);
    return { transactionId: tx.id };
  }

  async payoutInvestment(
    userId: string,
    principal: number,
    profit: number,
    currency = 'USDT',
  ): Promise<{ transactionId: string }> {
    const wallet = await this.getUserWallet(userId, currency);

    const locked = Number(wallet.balanceLocked);
    wallet.balanceLocked = (locked - principal).toFixed(8);

    const available = Number(wallet.balanceAvailable);
    wallet.balanceAvailable = (available + principal + profit).toFixed(8);

    await this.walletRepo.save(wallet);

    const tx = this.txRepo.create({
      userId,
      walletId: wallet.id,
      type: TransactionType.INVESTMENT_PAYOUT,
      amount: profit.toFixed(8),
      currency,
      status: TransactionStatus.COMPLETED,
      referenceType: 'INVESTMENT',
    });
    await this.txRepo.save(tx);

    return { transactionId: tx.id };
  }
}
