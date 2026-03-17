import { Controller, Post, Body, Req, Get, UseGuards } from '@nestjs/common';
import { InvestmentsService } from './investment.service';
import { CreateInvestmentDto } from './dto/create-investment.dto';
import { JwtAuthGuard } from '../common/guard/jwt-auth.guard';

@Controller('investments')
@UseGuards(JwtAuthGuard)
export class InvestmentsController {
  constructor(private readonly investmentsService: InvestmentsService) {}

  @Post()
  create(
    @Req() req: { user: { id: string } },
    @Body() dto: CreateInvestmentDto,
  ) {
    return this.investmentsService.create(req.user.id, dto);
  }

  @Get('me')
  findMyInvestments(@Req() req: { user: { id: string } }) {
    return this.investmentsService.findForUser(req.user.id);
  }
}
