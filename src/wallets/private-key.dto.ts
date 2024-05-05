import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class PrivateKeyDto {
  @IsNotEmpty()
  @ApiProperty()
  privateKey: string;
}
