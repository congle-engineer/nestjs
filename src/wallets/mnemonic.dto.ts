import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class MnemonicDto {
  @IsNotEmpty()
  @ApiProperty()
  mnemonic: string;

  @IsNotEmpty()
  @ApiProperty()
  index: number;
}
