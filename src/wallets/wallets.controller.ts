import { WalletsService } from './wallets.service';
import { Controller, Get, Param } from '@nestjs/common';
import { Public } from '../auth/auth.guard';

@Controller('wallets')
export class WalletsController {
  constructor(private walletsService: WalletsService) {}

  @Public()
  @Get(':address/balance')
  async getAddressBalance(@Param('address') address: string) {
    let balance = await this.walletsService.getAddressBalance(address);
    return {
      address: address,
      balance: balance
    }
  }
}
