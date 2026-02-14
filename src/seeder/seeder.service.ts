import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from 'src/user/entity/user.entity';
import { Role } from 'src/role/role.enum';
import { ConfigService } from 'src/config/config.service';
import * as bcrypt from 'bcrypt';
import 'dotenv/config';

@Injectable()
export class SeederService {
  private readonly logger = new Logger(SeederService.name);

  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async seed() {
    try {
      const user = new User();
      user.username = 'admin';
      const salt = await bcrypt.genSalt();
      user.password = await bcrypt.hash(ConfigService.Admin.password, salt);
      user.firstName = 'admin';
      user.lastName = 'admin';
      user.walletAddress = null;
      user.role = Role.Admin;
      user.email = ConfigService.Mail.user;
      user.emailVerified = true;
      user.isActive = true;

      const existUser = await this.userRepository.findOneBy({
        username: user.username,
      });
      if (!existUser) {
        await this.userRepository.save(user);
      }
    } catch (e) {
      this.logger.error('[Seeder] Failed with error: ', e);
    }
  }
}
