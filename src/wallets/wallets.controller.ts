
import { Controller, Get, Post, Body, UseGuards, Req } from '@nestjs/common';
import { WalletsService } from './wallets.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { DepositDto } from './dto/deposit.dto';
import { WithdrawDto } from './dto/withdraw.dto';

@Controller('wallets')
export class WalletsController {
  constructor(private readonly walletsService: WalletsService) {}

  @UseGuards(JwtAuthGuard)
  @Get('me')
  async getMyWallet(@Req() req) {
    const wallet = await this.walletsService.getUserWallet(req.user.id);
    return {
      status: 'success',
      userId: req.user.id,
      wallet,
    };
  }

  @UseGuards(JwtAuthGuard)
  @Post('deposit')
  async deposit(@Req() req, @Body() depositDto: DepositDto) {
    const result = await this.walletsService.deposit(
      req.user.id,
      depositDto.currency,
      depositDto.amount,
    );
    return { status: 'success', transaction: result };
  }

  @UseGuards(JwtAuthGuard)
  @Post('withdraw')
  async withdraw(@Req() req, @Body() withdrawDto: WithdrawDto) {
    const result = await this.walletsService.requestWithdraw(
      req.user.id,
      withdrawDto.currency,
      withdrawDto.amount,
    );
    return { status: 'success', transaction: result };
  }

  @UseGuards(JwtAuthGuard)
  @Get('history')
  async getHistory(@Req() req) {
    const history = await this.walletsService.getHistory(req.user.id);
    return { status: 'success', history };
  }
}