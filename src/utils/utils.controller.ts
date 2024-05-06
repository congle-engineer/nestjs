import {
  Controller,
  Get,
  // Post,
  // Body,
  // Patch,
  // Param,
  // Delete,
} from '@nestjs/common';
import { UtilsService } from './utils.service';
// import { CreateUtilDto } from './dto/create-util.dto';
// import { UpdateUtilDto } from './dto/update-util.dto';
import { Public } from '../auth/auth.guard';

@Public()
@Controller('utils')
export class UtilsController {
  constructor(private readonly utilsService: UtilsService) {}

  @Get('/generate/mnemonic')
  generateMnemonic() {
    const mnemonic = this.utilsService.generateMnemonic();
    return {
      mnemonic: mnemonic,
    };
  }

  @Get('/generate/privatekey')
  async generatePrivateKey() {
    const privateKey = await this.utilsService.generatePrivateKey();
    return {
      privateKey: privateKey,
    };
  }

  // @Post()
  // create(@Body() createUtilDto: CreateUtilDto) {
  //   return this.utilsService.create(createUtilDto);
  // }

  // @Get()
  // findAll() {
  //   return this.utilsService.findAll();
  // }

  // @Get(':id')
  // findOne(@Param('id') id: string) {
  //   return this.utilsService.findOne(+id);
  // }

  // @Patch(':id')
  // update(@Param('id') id: string, @Body() updateUtilDto: UpdateUtilDto) {
  //   return this.utilsService.update(+id, updateUtilDto);
  // }

  // @Delete(':id')
  // remove(@Param('id') id: string) {
  //   return this.utilsService.remove(+id);
  // }
}
