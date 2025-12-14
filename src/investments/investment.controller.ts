import { Controller, Post, Body, Req } from '@nestjs/common';
import { InvestmentsService } from './investment.service';
import { CreateInvestmentDto } from './dto/create-investment.dto';
// import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('investments')
// @UseGuards(JwtAuthGuard)
export class InvestmentsController {
  constructor(private readonly investmentsService: InvestmentsService) {}

  @Post()
  create(
    @Req() req: { user: { id: string } },
    @Body() dto: CreateInvestmentDto,
  ) {
    return this.investmentsService.create(req.user.id, dto);
  }
}
