import {
  Controller,
  UseGuards,
  Post,
  Body,
  Get,
} from '@nestjs/common';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { InvestmentsService } from './investments.service';
import { CreateInvestmentDto } from './dto/create-investment.dto';
import { User } from '../common/decorators/user.decorator';

@Controller('investments')
@UseGuards(JwtAuthGuard)
export class InvestmentsController {
  constructor(private readonly investmentsService: InvestmentsService) {}

  @Post()
  create(
    @User() user: any,
    @Body() dto: CreateInvestmentDto,
  ) {
    return this.investmentsService.create(user.userId, dto);
  }

  @Get()
  findMyInvestments(@User() user: any) {
    return this.investmentsService.findForUser(user.userId);
  }
}
