import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  Index,
} from 'typeorm';
import { Wallet } from './wallet.entity';

export type TransactionType = 'DEPOSIT' | 'WITHDRAW';
export type TransactionStatus = 'PENDING' | 'SUCCESS' | 'FAILED' | 'REJECTED';

@Entity()
export class Transaction {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Index()
  @Column()
  walletId!: string;

  @Column({ nullable: true })
  currency!: string;

  @ManyToOne(() => Wallet, (wallet) => wallet.transactions)
  wallet!: Wallet;

  @Column()
  type!: TransactionType;

  @Column({ type: 'decimal', precision: 18, scale: 8 })
  amount!: string;

  @Column()
  status!: TransactionStatus;

  @Column({ nullable: true })
  reference!: string;

  @Column({ nullable: true })
  adminNote!: string;

  @Column({ type: 'decimal', precision: 18, scale: 8, nullable: true })
  balanceBefore!: string;

  @Column({ type: 'decimal', precision: 18, scale: 8, nullable: true })
  balanceAfter!: string;

  @Column({ nullable: true })
  processedBy!: string;

  @Column({ type: 'timestamptz', nullable: true })
  processedAt!: Date;

  @Index()
  @Column({ nullable: true })
  userId!: string;

  @Column({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  createdAt!: Date;
}

