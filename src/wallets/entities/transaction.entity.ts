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
  id: string;

  @Index()
  @Column()
  walletId: string;

  @ManyToOne(() => Wallet, (wallet) => wallet.transactions)
  wallet: Wallet;

  @Column()
  type: TransactionType;

  @Column({ type: 'decimal', precision: 18, scale: 8 })
  amount: string;

  @Column()
  status: TransactionStatus;

  @Column({ nullable: true })
  reference: string; // can store external tx id, investment id, trade id, etc.

  @Column({ nullable: true })
  adminNote: string; // for admin decisions, failure reasons

  @Column({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;
}
