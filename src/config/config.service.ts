import { Injectable } from '@nestjs/common';
import 'dotenv/config';

@Injectable()
export class ConfigService {
  constructor() {}

  static DBConfig = {
    host: process.env.DATABASE_HOST,
    port: parseInt(process.env.DATABASE_PORT),
    userName: process.env.DATABASE_USERNAME,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE_NAME,
    synchronize: process.env.DATABASE_SYNC == '1'
  }

  static LucidConfig = {
    blockfrostUrl: process.env.BLOCKFROST_URL,
    blockfrostKey: process.env.BLOCKFROST_KEY,
    cardanoEnv: process.env.CARDANO_ENV
  }

  static JWTConfig = {
    secret: process.env.JWT_SECRET
  }

  static EncryptConfig = {
    key: process.env.ENCRYPT_KEY
  }
}
