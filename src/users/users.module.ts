import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { User } from './user.entity';
import { WalletsService } from 'src/wallets/wallets.service';

@Module({
  imports: [TypeOrmModule.forFeature([User])],
  providers: [UsersService, WalletsService],
  controllers: [UsersController],
  exports: [UsersService],
})
export class UsersModule {}
