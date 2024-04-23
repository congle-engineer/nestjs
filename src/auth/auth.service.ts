import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService
  ) {}

  async signIn(userName: string, password: string): Promise<any> {
    const user = await this.usersService.findOne(userName);
    if (user?.password) {
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        throw new UnauthorizedException();
      }
    }
    const payload = {
      sub: user.id,
      userName: user.userName,
      roles: user.roles
    }
    return {
      access_token: await this.jwtService.signAsync(payload)
    }
  }
}
