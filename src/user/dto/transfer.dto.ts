import { IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class TransferDto {
  @ApiProperty()
  @IsNotEmpty()
  fromAddress: string;

  @ApiProperty()
  @IsNotEmpty()
  toAddress: string;

  @ApiProperty()
  @IsNotEmpty()
  projectId: number;

  @ApiProperty()
  @IsNotEmpty()
  numberOfTrees: number;
}
