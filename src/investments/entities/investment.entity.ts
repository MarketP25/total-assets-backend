import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { InvestmentPlan } from '../../plans/entities/investment-plan.entity';
import { InvestmentStatus } from '../../common/enums/investment-status.enum';

@Entity('investments')
export class Investment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userId: string;

  @Column()
  planId: string;

  @ManyToOne(() => InvestmentPlan)
  @JoinColumn({ name: 'planId' })
  plan: InvestmentPlan;

  @Column({ type: 'decimal', precision: 18, scale: 8 })
  amountInvested: string;

  @Column({ type: 'decimal', precision: 10, scale: 4 })
  expectedYieldPercent: string;

  @Column({ type: 'decimal', precision: 18, scale: 8 })
  expectedPayoutAmount: string;

  @Column({ type: 'decimal', precision: 10, scale: 4, nullable: true })
  actualYieldPercent: string;

  @Column({ type: 'decimal', precision: 18, scale: 8, nullable: true })
  actualPayoutAmount: string;

  @Column({
    type: 'enum',
    enum: InvestmentStatus,
    default: InvestmentStatus.PENDING,
  })
  status: InvestmentStatus;

  @Column()
  fundedTransactionId: string;

  @Column({ nullable: true })
  payoutTransactionId: string;

  @Column()
  startTime: Date;

  @Column()
  endTime: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
