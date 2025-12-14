/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */

/* eslint-disable @typescript-eslint/no-unsafe-argument */
import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Wallet } from './entities/wallet.entity';
import { Transaction } from './entities/transaction.entity';
import { TransactionType } from '../common/enums/transaction-type.enum';
import { TransactionStatus } from '../common/enums/transaction-status.enum';
import { DepositDto } from './dto/deposit.dto';
import { WithdrawDto } from './dto/withdraw.dto';
import { AdminDecisionDto } from './dto/admin-decision.dto';

@Injectable()
export class WalletsService {
  constructor(
    @InjectRepository(Wallet)
    private readonly walletRepo: Repository<Wallet>,
    @InjectRepository(Transaction)
    private readonly transactionRepo: Repository<Transaction>,
    private readonly dataSource: DataSource,
  ) {}

  async getUserWallet(userId: string, currency = 'USDT') {
    let wallet = await this.walletRepo.findOne({
      where: { userId, currency },
    });
    if (!wallet) {
      wallet = this.walletRepo.create({
        userId,
        currency,
        balance: '0.00',
      });
      await this.walletRepo.save(wallet);
    }
    return wallet;
  }

  async getHistory(userId: string) {
    return this.transactionRepo.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
  }

  async deposit(userId: string, currency: string, amount: number) {
    const wallet = await this.getUserWallet(userId, currency);
    const transaction = this.transactionRepo.create({
      userId,
      type: TransactionType.DEPOSIT,
      status: 'SUCCESS',
      currency,
      amount: amount.toFixed(2),
      balanceBefore: wallet.balance,
      balanceAfter: (parseFloat(wallet.balance) + amount).toFixed(2),
    });
    await this.transactionRepo.save(transaction);
    wallet.balance = transaction.balanceAfter;
    await this.walletRepo.save(wallet);
    return transaction;
  }

  async requestWithdraw(userId: string, currency: string, amount: number) {
    const wallet = await this.getUserWallet(userId, currency);
    const balance = parseFloat(wallet.balance);
    if (balance < amount) {
      throw new BadRequestException('Insufficient balance');
    }
    const transaction = this.transactionRepo.create({
      userId,
      type: TransactionType.WITHDRAW,
      status: 'PENDING',
      currency,
      amount: amount.toFixed(2),
      balanceBefore: wallet.balance,
      balanceAfter: (balance - amount).toFixed(2),
    } as any);
    await this.transactionRepo.save(transaction);
    return transaction;
  }

  async fundInvestment(userId: string, amount: number, currency: string) {
    const wallet = await this.getUserWallet(userId, currency);
    const balance = parseFloat(wallet.balance);
    if (balance < amount) {
      throw new BadRequestException('Insufficient balance');
    }
    const transaction = this.transactionRepo.create({
      userId,
      type: TransactionType.DEPOSIT,
      status: TransactionStatus.SUCCESS,
      currency,
      amount: amount.toFixed(2),
      balanceBefore: wallet.balance,
      balanceAfter: (balance - amount).toFixed(2),
    });
    await this.transactionRepo.save(transaction);
    wallet.balance = transaction.balanceAfter;
    await this.walletRepo.save(wallet);
    return { transactionId: transaction.id };
  }

  async getPendingWithdrawals() {
    return this.transactionRepo.find({
      where: {
        type: TransactionType.WITHDRAW,
        status: TransactionStatus.PENDING,
      },
      relations: ['user'],
    });
  }

  async approveWithdrawal(transactionId: string, adminId: string) {
    const transaction = await this.transactionRepo.findOne({
      where: { id: transactionId },
    });
    if (!transaction || transaction.status !== TransactionStatus.PENDING) {
      throw new NotFoundException('Transaction not found or not pending');
    }
    (transaction as any).status = 'SUCCESS';
    transaction.processedBy = adminId;
    transaction.processedAt = new Date();
    await this.transactionRepo.save(transaction);

    const wallet = await this.getUserWallet(
      transaction.userId,
      transaction.currency,
    );
    wallet.balance = transaction.balanceAfter;
    await this.walletRepo.save(wallet);
    return transaction;
  }

  async rejectWithdrawal(transactionId: string, adminId: string) {
    const transaction = await this.transactionRepo.findOne({
      where: { id: transactionId },
    });
    if (!transaction || transaction.status !== 'PENDING') {
      throw new NotFoundException('Transaction not found or not pending');
    }
    transaction.status = TransactionStatus.REJECTED;
    transaction.processedBy = adminId;
    transaction.processedAt = new Date();
    await this.transactionRepo.save(transaction);

    // Revert balance
    const wallet = await this.getUserWallet(
      transaction.userId,
      transaction.currency,
    );
    wallet.balance = transaction.balanceBefore;
    await this.walletRepo.save(wallet);
    return transaction;
  }

  async creditWalletAdmin(dto: AdminDecisionDto) {
    const wallet = await this.getUserWallet(dto.userId, dto.currency);
    const amount = parseFloat(dto.amount);
    const newBalance = parseFloat(wallet.balance) + amount;
    const transaction = this.transactionRepo.create({
      userId: dto.userId,
      type: TransactionType.DEPOSIT,
      status: TransactionStatus.SUCCESS,
      currency: dto.currency,
      amount: dto.amount,
      balanceBefore: wallet.balance,
      balanceAfter: newBalance.toFixed(2),
    });
    await this.transactionRepo.save(transaction);
    wallet.balance = transaction.balanceAfter;
    await this.walletRepo.save(wallet);
    return transaction;
  }

  async payoutInvestment(userId: string, amount: number, currency: string) {
    const wallet = await this.getUserWallet(userId, currency);
    const transaction = this.transactionRepo.create({
      userId,
      type: TransactionType.WITHDRAW,
      status: TransactionStatus.SUCCESS,
      currency,
      amount: amount.toFixed(2),
      balanceBefore: wallet.balance,
      balanceAfter: (parseFloat(wallet.balance) + amount).toFixed(2),
    });
    await this.transactionRepo.save(transaction);
    wallet.balance = transaction.balanceAfter;
    await this.walletRepo.save(wallet);
    return transaction;
  }
}
