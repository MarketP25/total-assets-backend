import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { RiskLevel } from '../../common/enums/risk-level.enum';

@Entity({ name: 'investment_plans' })
export class InvestmentPlan {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  code: string;

  @Column()
  name: string;

  @Column()
  description: string;

  @Column({ type: 'decimal', precision: 18, scale: 2 })
  minAmount: string;

  @Column({ type: 'decimal', precision: 18, scale: 2, nullable: true })
  maxAmount: string | null;

  @Column()
  durationHours: number;

  @Column({ type: 'decimal', precision: 6, scale: 2 })
  targetYieldMinPercent: string;

  @Column({ type: 'decimal', precision: 6, scale: 2 })
  targetYieldMaxPercent: string;

  @Column({
    type: 'enum',
    enum: RiskLevel,
    default: RiskLevel.LOW,
  })
  riskLevel: RiskLevel;

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
