import { Body, Controller, Get, Post } from '@nestjs/common';
import { UserService } from './user.service';
import { ApiBearerAuth } from '@nestjs/swagger';
import { UserDto } from './user.dto';
import { UserResponse } from './user.response';
import { User } from './user.entity';
import { Public } from '../auth/auth.guard';

// @ApiBearerAuth()
@Controller({
  version: '1',
})
export class UserController {
  constructor(private userService: UserService) {}

  @Public()
  @Post('create')
  async createUser(@Body() user: UserDto): Promise<UserResponse> {
    const userData = new User();
    userData.username = user.username;
    userData.password = user.password;
    userData.firstName = user.firstName;
    userData.lastName = user.lastName;

    const newUser = await this.userService.create(userData);

    const userRes = new UserResponse();
    userRes.id = newUser.id;
    userRes.username = newUser.username;
    userRes.firstName = newUser.firstName;
    userRes.lastName = newUser.lastName;
    userRes.isActive = newUser.isActive;

    return userRes;
  }
}
