import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty()
  user_name: string;

  @ApiProperty()
  password: string;
}
