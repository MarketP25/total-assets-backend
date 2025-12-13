import {
  Injectable,
  BadRequestException,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Wallet } from './entities/wallet.entity';
import {
  Transaction,
  TransactionStatus,
  TransactionType,
} from './entities/transaction.entity';
import { CreditWalletDto } from '../admin/dto/credit-wallet.dto';
import { AdminDecisionDto } from './dto/admin-decision.dto';

@Injectable()
export class WalletsService {
  constructor(
    @InjectRepository(Wallet)
    private readonly walletRepo: Repository<Wallet>,

    @InjectRepository(Transaction)
    private readonly txRepo: Repository<Transaction>,
    private readonly dataSource: DataSource,
  ) {}

  private readonly logger = new Logger(WalletsService.name);

  private toNumber(value: string | number): number {
    return typeof value === 'number' ? value : Number(value);
  }

  private toDB(value: number): string {
    return value.toFixed(8);
  }

  // Generic: usable by investments, trades, etc.
  async getOrCreateWallet(
    userId: string,
    currency: string,
    walletType?: string,
  ) {
    const existingWallet = await this.walletRepo.findOne({
      where: { userId, currency, walletType },
    });

    if (existingWallet) {
      return existingWallet;
    }

    const newWallet = this.walletRepo.create({
      userId,
      currency,
      walletType: walletType ?? undefined,

      balance: this.toDB(0),
    });

    return this.walletRepo.save(newWallet);
  }

  async getUserWallet(userId: string, currency: string, walletType?: string) {
    const wallet = await this.walletRepo.findOne({
      where: { userId, currency, walletType },
    });

    // A 'get' method should not create. It should return the entity or null.
    return wallet;
  }

  // For user deposits – can be used for both investment and trading funding
  async deposit(
    userId: string,
    currency: string,
    amount: number,
    walletType?: string,
  ) {
    if (amount <= 0) {
      throw new BadRequestException('Amount must be greater than zero');
    }

    const wallet = await this.getOrCreateWallet(userId, currency, walletType);
    const currentBalance = this.toNumber(wallet.balance);
    const newBalance = currentBalance + amount;

    wallet.balance = this.toDB(newBalance);
    await this.walletRepo.save(wallet);

    const tx = this.txRepo.create({
      walletId: wallet.id,
      type: TransactionType.DEPOSIT,
      amount: this.toDB(amount),
      status: TransactionStatus.SUCCESS,
    });

    await this.txRepo.save(tx);

    return { wallet, transaction: tx };
  }

  // For user withdrawal requests – admin will approve in later phase
  async requestWithdraw(
    userId: string,
    currency: string,
    amount: number,
    walletType?: string,
  ) {
    if (amount <= 0) {
      throw new BadRequestException('Amount must be greater than zero');
    }

    // A withdrawal should only be possible from an existing wallet.
    const wallet = await this.getUserWallet(userId, currency, walletType);
    if (!wallet) {
      throw new NotFoundException('Wallet not found.');
    }

    const currentBalance = this.toNumber(wallet.balance);

    if (currentBalance < amount) {
      throw new BadRequestException('Insufficient balance');
    }
    // Note: We are NOT deducting the balance here. The balance should only be
    // deducted when the withdrawal is approved by an admin.
    // This prevents funds from being locked while a request is pending.

    const tx = this.txRepo.create({
      walletId: wallet.id,
      type: TransactionType.WITHDRAW, // Correctly reference enum member
      amount: this.toDB(amount),
      status: TransactionStatus.PENDING,
    });

    return this.txRepo.save(tx);
  }

  async getHistory(userId: string, currency: string, walletType?: string) {
    const wallet = await this.getOrCreateWallet(userId, currency, walletType);

    return this.txRepo.find({
      where: { walletId: wallet.id },
      order: { createdAt: 'DESC' },
    });
  }

  async creditWalletAdmin(creditDto: CreditWalletDto): Promise<Transaction> {
    const { userId, currency, amount } = creditDto;
    const wallet = await this.getOrCreateWallet(userId, currency);

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      wallet.balance = this.toDB(this.toNumber(wallet.balance) + amount);
      await queryRunner.manager.save(wallet);

      const transaction = this.txRepo.create({
        walletId: wallet.id,
        type: TransactionType.DEPOSIT,
        amount: this.toDB(amount),
        status: TransactionStatus.SUCCESS,
        adminNote: 'Manual credit by admin.',
      });
      const savedTransaction = await queryRunner.manager.save(transaction);

      await queryRunner.commitTransaction();
      return savedTransaction;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      this.logger.error(
        `Admin credit failed for userId: ${userId}`,
        error.stack,
      );
      throw new BadRequestException('Admin credit failed.');
    } finally {
      await queryRunner.release();
    }
  }

  async fundInvestment(userId: string, amount: number, currency: string) {
    const wallet = await this.getUserWallet(userId, currency);

    if (!wallet || this.toNumber(wallet.balance) < amount) {
      throw new BadRequestException('Insufficient funds for investment.');
    }

    wallet.balance = this.toDB(this.toNumber(wallet.balance) - amount);
    await this.walletRepo.save(wallet);

    const transaction = this.txRepo.create({
      walletId: wallet.id,
      type: 'WITHDRAW' as TransactionType,
      amount: this.toDB(amount),
      status: 'SUCCESS' as TransactionStatus,
      reference: 'investment_funding',
    });

    const savedTx = await this.txRepo.save(transaction);
    return { transactionId: savedTx.id };
  }

  async getAllWithdrawRequests(): Promise<Transaction[]> {
    return this.txRepo.find({
      where: {
        type: TransactionType.WITHDRAW,
        status: TransactionStatus.PENDING,
      },
      relations: ['wallet'],
    });
  }

  async decideWithdrawal(
    transactionId: string,
    decision: AdminDecisionDto,
  ): Promise<Transaction> {
    const transaction = await this.txRepo.findOne({
      where: { id: transactionId, status: TransactionStatus.PENDING },
      relations: ['wallet'], // Load the related wallet
    });

    if (!transaction) {
      throw new NotFoundException('Pending withdrawal transaction not found.');
    }

    const wallet = transaction.wallet;
    if (!wallet) {
      // This should ideally never happen if database constraints are set up
      throw new NotFoundException('Associated wallet not found.');
    }

    if (decision.status === TransactionStatus.SUCCESS) {
      // On approval, check balance again and deduct funds.
      const currentBalance = this.toNumber(wallet.balance);
      const withdrawalAmount = this.toNumber(transaction.amount);

      if (currentBalance < withdrawalAmount) {
        // If balance is now insufficient, reject the transaction
        transaction.status = TransactionStatus.REJECTED;
        transaction.adminNote =
          decision.adminNote ||
          'Rejected due to insufficient funds at time of approval.';
        return this.txRepo.save(transaction);
      }

      wallet.balance = this.toDB(currentBalance - withdrawalAmount);
      await this.walletRepo.save(wallet);
    }

    if (decision.status === TransactionStatus.REJECTED) {
      // If rejected, no balance change is needed as we didn't deduct it initially.
    }

    transaction.status = decision.status;
    transaction.adminNote = decision.adminNote || transaction.adminNote; // Preserve existing note if new one isn't provided

    return this.txRepo.save(transaction);
  }

  /**
   * For Admins: Decide on a pending withdrawal request.
   * This operation is transactional to ensure atomicity.
   */
  async decideWithdraw(
    transactionId: string,
    decision: 'APPROVE' | 'REJECT',
    note?: string,
  ): Promise<Transaction> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const transaction = await queryRunner.manager.findOne(Transaction, {
        where: { id: transactionId, status: TransactionStatus.PENDING },
        relations: ['wallet'],
      });

      if (!transaction) {
        throw new NotFoundException(
          'Pending withdrawal transaction not found.',
        );
      }

      const wallet = transaction.wallet;
      if (!wallet) {
        throw new NotFoundException(
          'Associated wallet not found for this transaction.',
        );
      }

      if (decision === 'APPROVE') {
        const currentBalance = this.toNumber(wallet.balance);
        const withdrawalAmount = this.toNumber(transaction.amount);

        if (currentBalance < withdrawalAmount) {
          throw new BadRequestException(
            'Wallet has insufficient funds at time of approval.',
          );
        }

        wallet.balance = this.toDB(currentBalance - withdrawalAmount);
        await queryRunner.manager.save(wallet);

        transaction.status = TransactionStatus.SUCCESS;
      } else {
        // REJECT
        transaction.status = TransactionStatus.REJECTED;
        // No balance change is needed since funds were never deducted.
      }

      transaction.adminNote = note;
      const updatedTransaction = await queryRunner.manager.save(transaction);

      await queryRunner.commitTransaction();
      return updatedTransaction;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      this.logger.error(
        `Failed to decide on withdrawal ${transactionId}`,
        error.stack,
      );
      throw error; // Re-throw the original error after rollback
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * For Admins: Get a ledger of all recent transactions.
   */
  async getGlobalTransactions(): Promise<Transaction[]> {
    return this.txRepo.find({
      order: { createdAt: 'DESC' },
      take: 100,
      relations: ['wallet'],
    });
  }
}
