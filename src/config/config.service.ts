import { Injectable } from '@nestjs/common';
import 'dotenv/config';

@Injectable()
export class ConfigService {
  constructor() {}

  static DBConfig = {
    host: process.env.DATABASE_HOST,
    port: parseInt(process.env.DATABASE_PORT),
    username: process.env.DATABASE_USERNAME,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE_NAME,
    synchronize: process.env.DATABASE_SYNC == '1',
  };

  static LucidConfig = {
    blockfrost_url: process.env.BLOCKFROST_URL,
    blockfrost_key: process.env.BLOCKFROST_KEY,
    cardano_env: process.env.CARDANO_ENV,
  };

  static JWTConfig = {
    secret: process.env.JWT_SECRET,
  };

  static EncryptConfig = {
    key: process.env.ENCRYPT_KEY,
  };
}
