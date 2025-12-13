import { Controller, Get, UseGuards } from '@nestjs/common';
import { WalletsService } from './wallets.service';
import { JwtAuthGuard } from '../common/guard/jwt-auth.guard';
import { User } from '../common/decorators/user.decorator;;

@Controller('wallets')
@UseGuards(JwtAuthGuard)
export class WalletsController {
  constructor(private readonly walletsService: WalletsService) {}

  @Get('me')
  getMyWallet(@User() user: any) {
    return this.walletsService.getUserWallet(user.userId, 'USDT');
  }
}
