import { Controller, Get, UseGuards } from '@nestjs/common';
import { Request } from 'express';
import { JwtAuthGuard } from '../common/guard/jwt-auth.guard';
import { DashboardService } from './dashboard.service';
import { DashboardOverviewDto } from './dto/dashboard-overview.dto';

@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @UseGuards(JwtAuthGuard)
@Get('overview')
  async getOverview(@Req() req: Request & { user: { id: string } }) {
    return await (this.dashboardService as any).getOverview(req.user.id);
  }
}
