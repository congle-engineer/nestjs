import { WalletsService } from './wallets.service';
import { Controller } from '@nestjs/common';

@Controller('wallets')
export class WalletsController {
  constructor(private walletsService: WalletsService) {}
}
