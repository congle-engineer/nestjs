import { WalletsService } from './wallets.service';
import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { Public } from '../auth/auth.guard';
import { PrivateKeyDto } from './private-key.dto';
import { MnemonicDto } from './mnemonic.dto';

@Controller('wallets')
export class WalletsController {
  constructor(private walletsService: WalletsService) {}

  @Public()
  @Post('/create/address/from/mnemonic')
  async createAddressFromMnemonic(@Body() body: MnemonicDto) {
    const address = await this.walletsService.createAddressFromMnemonic(body.mnemonic, body.index);
    return {
      address: address
    }
  }

  @Public()
  @Post('/create/address/from/privatekey')
  async createAddressFromPrivateKey(@Body() body: PrivateKeyDto) {
    const address = await this.walletsService.createAddressFromPrivateKey(body.privateKey);
    return {
      address: address
    }
  }

  @Public()
  @Get(':address/balance')
  async getAddressBalance(@Param('address') address: string) {
    const balance = await this.walletsService.getAddressBalance(address);
    return {
      address: address,
      balance: balance
    }
  }
}
