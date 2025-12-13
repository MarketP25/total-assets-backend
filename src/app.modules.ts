import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';

import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { WalletsModule } from './wallets/wallets.module';
import { PlansModule } from './plans/plans.module';
import { InvestmentsModule } from './investments/investment.module';
import { AdminModule } from './admin/admin.module';
import { AuditModule } from './audit/audit.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'ta_user',
      password: 'ta_pass',
      database: 'total_assets',
      synchronize: true, // DEV ONLY
      autoLoadEntities: true,
    }),
    ScheduleModule.forRoot(),
    UsersModule,
    AuthModule,
    WalletsModule,
    PlansModule,
    InvestmentsModule,
    AdminModule,
    AuditModule,
  ],
})
export class AppModule {}
