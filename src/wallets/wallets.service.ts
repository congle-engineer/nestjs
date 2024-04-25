import { Injectable } from '@nestjs/common';
import { type Lucid } from 'lucid-cardano';
import { ConfigService } from '../config/config.service';
import { BlockFrostAPI } from '@blockfrost/blockfrost-js';
import {
  createCipheriv,
  createDecipheriv,
  createHash,
  randomBytes,
} from 'crypto';

const alg = 'aes-256-ctr';
let key = ConfigService.EncryptConfig.key;
key = createHash('sha256').update(String(key)).digest('base64').substr(0, 32);

async function getLucid(): Promise<Lucid> {
  const module = await (eval(`import('lucid-cardano')`) as Promise<any>);
  const lucid: Lucid = await module.Lucid.new(
    new module.Blockfrost(
      ConfigService.LucidConfig.blockfrost_url,
      ConfigService.LucidConfig.blockfrost_key,
    ),
    ConfigService.LucidConfig.cardano_env,
  );
  return lucid;
}

export class Address {
  privateKey: string;
  address: string;
}

const API = new BlockFrostAPI({
  projectId: ConfigService.LucidConfig.blockfrost_key,
});

@Injectable()
export class WalletsService {
  decrypt(data): Buffer {
    const iv = data.slice(0, 16);
    data = data.slice(16);
    const decipher = createDecipheriv(alg, key, iv);
    const result = Buffer.concat([decipher.update(data), decipher.final()]);
    return result;
  }

  async encrypt(data): Promise<Buffer> {
    const iv = randomBytes(16);
    const cipher = createCipheriv(alg, key, iv);
    const result = Buffer.concat([iv, cipher.update(data), cipher.final()]);
    return result;
  }

  async createAddress(): Promise<Address> {
    const lucid: Lucid = await getLucid();
    const privateKey = lucid.utils.generatePrivateKey();
    lucid.selectWalletFromPrivateKey(privateKey);
    const address = await lucid.wallet.address();
    const bcObj = new Address();
    bcObj.privateKey = (
      await this.encrypt(Buffer.from(privateKey, 'utf8'))
    ).toString('hex');
    bcObj.address = address;
    return bcObj;
  }

  async getAddressBalance(address) {
    const balance = await API.addresses(address);
    return balance.amount;
  }
}
