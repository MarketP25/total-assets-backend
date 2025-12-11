import {
  Controller,
  UseGuards,
  Get,
  Param,
  Post,
  Body,
} from '@nestjs/common';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../common/enums/role.enum';
import { UsersService } from '../users/users.service';
import { WalletsService } from '../wallets/wallets.service';

@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
export class AdminController {
  constructor(
    private readonly usersService: UsersService,
    private readonly walletsService: WalletsService,
  ) {}

  @Get('users')
  listUsers() {
    return this.usersService.findAll();
  }

  @Get('users/:id')
  getUser(@Param('id') id: string) {
    return this.usersService.findById(id);
  }

  @Post('users/:id/wallets/credit')
  async creditWallet(
    @Param('id') userId: string,
    @Body() body: { amount: number; currency?: string; adminId: string },
  ) {
    return this.walletsService.creditWalletAdmin(
      body.adminId,
      userId,
      body.amount,
      body.currency ?? 'USDT',
    );
  }
}
