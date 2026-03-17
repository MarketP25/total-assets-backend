import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { WalletsService } from '../wallets/wallets.service';
import { CreditWalletDto } from './dto/credit-wallet.dto';
import { JwtAuthGuard } from '../common/guard/jwt-auth.guard';
import { RolesGuard } from '../common/guard/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../common/enums/role.enum';

@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
export class AdminController {
  constructor(private readonly walletsService: WalletsService) {}

  @Post('wallets/credit')
  async creditWallet(@Body() creditDto: CreditWalletDto) {
    return await (this.walletsService as any).creditWalletAdmin(creditDto);
  }
}
