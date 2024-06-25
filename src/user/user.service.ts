import { Injectable } from '@nestjs/common';
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

  findAll(): Promise<User[]> {
    return this.userRepository.find();
  }

  async findOne(username: string): Promise<User | null> {
    const result: User = await this.userRepository.findOneBy({ username });
    return result;
  }

  async remove(id: string): Promise<void> {
    await this.userRepository.delete(id);
  }

  async create(user: User): Promise<User | null> {
    try {
      const salt = await bcrypt.genSalt();
      user.password = await bcrypt.hash(user.password, salt);
      user.isActive = true;

      return await this.userRepository.save(user);
    } catch (e) {
      console.log(e);
      return null;
    }
  }
}
