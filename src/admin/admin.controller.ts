import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { WalletsService } from '../wallets/wallets.service';
import { CreditWalletDto } from './dto/credit-wallet.dto';
// import { RolesGuard } from '../auth/guards/roles.guard';
// import { Roles } from '../auth/decorators/roles.decorator';

@Controller('admin')
// @UseGuards(RolesGuard)
export class AdminController {
  constructor(private readonly walletsService: WalletsService) {}

  @Post('wallets/credit')
  // @Roles('admin')
  async creditWallet(@Body() creditDto: CreditWalletDto) {
    return this.walletsService.creditWalletAdmin(creditDto);
  }
}
