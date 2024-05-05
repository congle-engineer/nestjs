import { Injectable } from '@nestjs/common';
import { CreateUtilDto } from './dto/create-util.dto';
import { UpdateUtilDto } from './dto/update-util.dto';
import { generateMnemonic } from 'bip39';
import { type Lucid } from 'lucid-cardano';
import { ConfigService } from '../config/config.service';

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

@Injectable()
export class UtilsService {
  // create(createUtilDto: CreateUtilDto) {
  //   return 'This action adds a new util';
  // }

  // findAll() {
  //   return `This action returns all utils`;
  // }

  // findOne(id: number) {
  //   return `This action returns a #${id} util`;
  // }

  // update(id: number, updateUtilDto: UpdateUtilDto) {
  //   return `This action updates a #${id} util`;
  // }

  // remove(id: number) {
  //   return `This action removes a #${id} util`;
  // }

  generateMnemonic() {
    return generateMnemonic();
  }

  async generatePrivateKey() {
    const lucid: Lucid = await getLucid();
    const privateKey = lucid.utils.generatePrivateKey();
    return privateKey;
  }
}
