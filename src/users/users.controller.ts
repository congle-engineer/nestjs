import { Body, Controller, Get, Post } from '@nestjs/common';
import { UsersService } from './users.service';
import { ApiBearerAuth } from '@nestjs/swagger';
import { UserDto } from './user.dto';
import { UserResponse } from './user.response';
import { User } from './user.entity';
import { Roles } from 'src/role/roles.decorator';
import { Role } from 'src/role/role.enum';

@ApiBearerAuth()
@Controller({
  version: '1'
}) 
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Roles(Role.Admin)
  @Get()
  async findAll(): Promise<UserResponse[]> {
    const users = await this.usersService.findAll();
    const userRes: UserResponse[] = [];
    users.forEach(x => {
      const user = new UserResponse();
      user.id = x.id;
      user.userName = x.userName;
      user.firstName = x.firstName;
      user.lastName = x.lastName;
      user.address = x.address;
      userRes.push(user);
    });
    return userRes;
  }

  @Roles(Role.Admin)
  @Post()
  async createUser(@Body() user: UserDto): Promise<UserResponse> {
    const userData = new User();
    userData.firstName = user.firstName;
    userData.lastName = user.lastName;
    userData.userName = user.userName;
    userData.password = user.password;
    
    const newUser = await this.usersService.create(userData);

    const userRes = new UserResponse();
    userRes.id = newUser.id;
    userRes.userName = newUser.userName;
    userRes.firstName = newUser.firstName;
    userRes.lastName = newUser.lastName;
    userRes.address = newUser.address;

    return userRes;
  }
}
