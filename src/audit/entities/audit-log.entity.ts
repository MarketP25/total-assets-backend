import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

@Entity({ name: 'audit_logs' })
export class AuditLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: true })
  actorId: string | null; // user/admin id

  @Column({ nullable: true })
  actorRole: string | null; // 'USER' | 'ADMIN' | 'SYSTEM'

  @Column()
  action: string; // 'USER_REGISTER', 'ADMIN_CREDIT_WALLET', etc.

  @Column({ nullable: true })
  entityType: string | null; // 'USER', 'WALLET', 'INVESTMENT', etc.

  @Column({ nullable: true })
  entityId: string | null;

  @Column({ type: 'jsonb', nullable: true })
  metadata: any;

  @Column({ nullable: true })
  ipAddress: string | null;

  @Column({ nullable: true })
  userAgent: string | null;

  @CreateDateColumn()
  createdAt: Date;
}