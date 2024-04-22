import { CacheInterceptor } from '@nestjs/cache-manager';
import { Controller, Get, UseInterceptors, Param } from '@nestjs/common';

@Controller()
@UseInterceptors(CacheInterceptor)
export class AppController {
  @Get()
  findAll() {
    console.log('call findAll ...');
    return [{ id: 1, name: "congle" }];
  }

  @Get(':id')
  findOne(@Param('id') id: number) {
    console.log(`call findOne with id: ${id}`);
    return [{ id: 1, name: "lucas" }];
  }
}
