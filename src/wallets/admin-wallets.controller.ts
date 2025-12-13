import {
  Controller,
  Get,
  Patch,
  Param,
  Body,
  UseGuards,
  ParseUUIDPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { WalletsService } from './wallets.service';
import { AdminDecisionDto } from './dto/admin-decision.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../common/enums/role.enum';

@Controller('admin/wallets')
@UseGuards(JwtAuthGuard, RolesGuard) // Protect all routes in this controller
@Roles(Role.ADMIN) // Require ADMIN role for all routes in this controller
export class AdminWalletsController {
  constructor(private readonly walletsService: WalletsService) {}

  @Get('withdraw-requests')
  getAllWithdrawRequests() {
    return this.walletsService.getAllWithdrawRequests();
  }

  @Patch('withdraw/:id/decision')
  @HttpCode(HttpStatus.OK)
  decideWithdrawal(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() decisionDto: AdminDecisionDto,
  ) {
    const { decision, note } = decisionDto;
    return this.walletsService.decideWithdraw(id, decision, note);
  }

  @Get('transactions')
  getGlobalTransactions() {
    return this.walletsService.getGlobalTransactions();
  }
}
