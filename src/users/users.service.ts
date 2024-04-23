import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import { WalletsService } from '../wallets/wallets.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    private walletsService: WalletsService
  ) {}

  findAll(): Promise<User[]> {
    return this.usersRepository.find();
  }

  async findOne(userName: string): Promise<User | null> {
    const result: User = await this.usersRepository.findOneBy({ userName });
    result.privateKey = (
      await this.walletsService.decrypt(Buffer.from(result.privateKey, 'hex'))
    ).toString('utf8');
    return result;
  }

  async remove(id: string): Promise<void> {
    await this.usersRepository.delete(id);
  }

  async create(user: User): Promise<User | null> {
    try {
      const salt = await bcrypt.genSalt();
      user.password = await bcrypt.hash(user.password, salt);
      user.isActive = true;

      const bcObj = await this.walletsService.createAddress();
      user.privateKey = bcObj.privateKey;
      user.address = bcObj.address;

      return await this.usersRepository.save(user);
    } catch(err) {
      console.log(err);
      return null;
    }
  }
}
