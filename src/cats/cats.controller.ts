import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { CatsService } from './cats.service';
import { CreateCatDto } from './dto/create-cat.dto';
// import { UpdateCatDto } from './dto/update-cat.dto';
// import type { Request } from 'express';
// import { Roles } from '../common/decorators/roles.decorator';
import { RolesGuard } from '../common/guards/roles.guard';
import { ParseIntPipe } from '../common/pipes/parse-int.pipe';
import { Cat } from './interfaces/cat.interface';

@UseGuards(RolesGuard)
@Controller('cats')
export class CatsController {
  constructor(private readonly catsService: CatsService) {}

  @Post()
  // @Roles(['admin'])
  create(@Body() createCatDto: CreateCatDto) {
    this.catsService.create(createCatDto);
  }

  @Get()
  async findAll(): Promise<Cat[]> {
    return this.catsService.findAll();
  }

  @Get(':id')
  // @Redirect('https://nestjs.com', 301)
  findOne(
    @Param('id', new ParseIntPipe())
    id: number,
  ) {
    // return this.catsService.findOne(id);
    console.log(id);
  }

  // @Patch(':id')
  // update(@Param('id') id: string, @Body() updateCatDto: UpdateCatDto) {
  //   return this.catsService.update(+id, updateCatDto);
  // }

  // @Delete(':id')
  // remove(@Param('id') id: string) {
  //   return this.catsService.remove(+id);
  // }
}
