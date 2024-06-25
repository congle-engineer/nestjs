import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  findAll() {
    return this.userRepository.find();
  }

  async findOne(username: string) {
    const result: User = await this.userRepository.findOneBy({ username });
    return result;
  }

  async remove(id: string) {
    await this.userRepository.delete(id);
  }

  async create(user: User) {
    try {
      const salt = await bcrypt.genSalt();
      user.password = await bcrypt.hash(user.password, salt);
      user.isActive = true;

      const existUser = await this.userRepository.findOneBy({ username: user.username });
      if (existUser) {
        throw new HttpException('This username has already been used!', HttpStatus.BAD_REQUEST);
      }

      return await this.userRepository.save(user);
    } catch (e) {
      throw new HttpException(e.response, e.status);
    }
  }
}
