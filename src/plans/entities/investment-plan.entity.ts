import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('investment_plans')
export class InvestmentPlan {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ default: true })
  isActive: boolean;

  @Column('decimal', { precision: 18, scale: 8 })
  minAmount: string;

  @Column('decimal', { precision: 18, scale: 8, nullable: true })
  maxAmount: string;

  @Column('decimal', { precision: 5, scale: 2 })
  targetYieldMinPercent: string;

  @Column('decimal', { precision: 5, scale: 2 })
  targetYieldMaxPercent: string;

  @Column('int')
  durationHours: number;
}
