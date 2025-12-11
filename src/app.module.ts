import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { WalletsModule } from './wallets/wallets.module';
import { PlansModule } from './plans/plans.module';
import { InvestmentsModule } from './investments/investments.module';
import { AdminModule } from './admin/admin.module';
import { AuditModule } from './audit/audit.module';

@Module({
  imports: [
    UsersModule,
    AuthModule,
    WalletsModule,
    PlansModule,
    InvestmentsModule,
    AdminModule,
    AuditModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
