import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SeederService } from './seeder.service';
import { UserModule } from 'src/user/user.module';
import { DbModule } from 'src/db/db.module';
import { User } from 'src/user/entity/user.entity';

@Module({
  providers: [SeederService],
  imports: [TypeOrmModule.forFeature([User]), UserModule, DbModule],
})
export class SeederModule {}
