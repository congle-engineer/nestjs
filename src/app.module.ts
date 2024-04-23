import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { RouterModule } from '@nestjs/core';
import { AuthModule } from './auth/auth.module';
import { ThrottlerModule } from '@nestjs/throttler';
import { DbModule } from './db/db.module';
import { SeederModule } from './seeder/seeder.module';
import { RolesModule } from './role/roles.module';

@Module({
  imports: [
    ThrottlerModule.forRoot([
      {
        ttl: 6000,
        limit: 10
      }
    ]),
    UsersModule,
    RouterModule.register([
      {
        path: 'users',
        module: UsersModule
      }
    ]),
    AuthModule,
    DbModule,
    SeederModule,
    RolesModule
  ],
  controllers: [AppController],
  providers: [AppService]
})

export class AppModule {}
