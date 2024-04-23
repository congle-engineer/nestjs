import { Injectable } from '@nestjs/common';
import { User } from 'src/users/user.entity';
import { UsersService } from 'src/users/users.service';
import { Role } from 'src/role/role.enum';
import 'dotenv/config';

@Injectable()
export class SeederService {
  constructor(private usersService: UsersService) {}

  async seed(): Promise<User[]> {
    try {
      const users: User[] = [];

      const userData = new User();
      userData.firstName = 'admin';
      userData.lastName = 'admin';
      userData.userName = 'admin';
      userData.password = process.env.ADMIN_PASS;
      userData.roles = [Role.Admin];

      users.push(await this.usersService.create(userData));

      return users;
    } catch (err) {
      throw err;
    }
  }
}
