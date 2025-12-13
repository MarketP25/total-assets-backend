import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  Index,
} from 'typeorm';
import { Transaction } from './transaction.entity';

@Entity()
export class Wallet {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column()
  userId: string;

  @Index()
  @Column()
  currency: string; // e.g. 'USDT', 'KES', 'USD', 'BTC'

  @Column({ nullable: true })
  walletType: string; // e.g. 'INVESTMENT', 'TRADING', 'SAVINGS' – client-defined

  @Column({ type: 'decimal', precision: 18, scale: 8, default: 0 })
  balance: string; // string to avoid float precision issues

  @Column({ type: 'json', nullable: true })
  metadata: any; // for future extensions: provider ids, flags, etc.

  @OneToMany(() => Transaction, (tx) => tx.wallet)
  transactions: Transaction[];
}
