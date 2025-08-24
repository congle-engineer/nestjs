import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Expose } from 'class-transformer';

@Exclude()
export class UserResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  @Expose()
  username: string;

  @ApiProperty()
  password: string;

  @ApiProperty()
  @Expose()
  firstName: string;

  @ApiProperty()
  @Expose()
  lastName: string;

  @ApiProperty()
  @Expose()
  email: string;

  @ApiProperty()
  @Expose()
  walletAddress: string;

  @ApiProperty()
  emailVerified: boolean;

  @ApiProperty()
  @Expose()
  role: string;

  @ApiProperty()
  otp: string;

  @ApiProperty()
  isActive: boolean;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}
