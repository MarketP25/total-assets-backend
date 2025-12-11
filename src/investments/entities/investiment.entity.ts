import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
  JoinColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { InvestmentPlan } from '../../plans/entities/investment-plan.entity';
import { InvestmentStatus } from '../../common/enums/investment-status.enum';

@Entity({ name: 'investments' })
export class Investment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ name: 'user_id' })
  userId: string;

  @ManyToOne(() => InvestmentPlan)
  @JoinColumn({ name: 'plan_id' })
  plan: InvestmentPlan;

  @Column({ name: 'plan_id' })
  planId: string;

  @Column({ type: 'decimal', precision: 18, scale: 2 })
  amountInvested: string;

  @Column({ type: 'decimal', precision: 6, scale: 2 })
  expectedYieldPercent: string;

  @Column({ type: 'decimal', precision: 18, scale: 2 })
  expectedPayoutAmount: string;

  @Column({ type: 'decimal', precision: 6, scale: 2, nullable: true })
  actualYieldPercent: string | null;

  @Column({ type: 'decimal', precision: 18, scale: 2, nullable: true })
  actualPayoutAmount: string | null;

  @Column({
    type: 'enum',
    enum: InvestmentStatus,
    default: InvestmentStatus.ACTIVE,
  })
  status: InvestmentStatus;

  @Column({ nullable: true })
  fundedTransactionId: string | null;

  @Column({ nullable: true })
  payoutTransactionId: string | null;

  @Column({ type: 'timestamp', nullable: true })
  startTime: Date | null;

  @Column({ type: 'timestamp', nullable: true })
  endTime: Date | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
