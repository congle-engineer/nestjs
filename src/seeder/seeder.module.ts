import { Module } from '@nestjs/common';
import { SeederService } from './seeder.service';
import { UsersModule } from 'src/users/users.module';
import { DbModule } from 'src/db/db.module';

@Module({
  providers: [SeederService],
  imports: [UsersModule, DbModule],
})

export class SeederModule {}
