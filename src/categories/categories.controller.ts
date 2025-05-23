import { Controller, Get, Post, Body, Param, Delete, Patch } from '@nestjs/common';
import { CategoriesService } from './categories.service';

@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Get()
  getAll() {
    return this.categoriesService.findAll();
  }

  @Get(':id')
  getOne(@Param('id') id: number) {
    return this.categoriesService.findOne(id);
  }

  @Post()
  create(@Body('category_name') category_name: string) {
    return this.categoriesService.create(category_name);
  }

  @Patch(':id')
  update(@Param('id') id: number, @Body('category_name') category_name: string) {
    return this.categoriesService.update(id, category_name);
  }

  @Delete(':id')
  delete(@Param('id') id: number) {
    return this.categoriesService.delete(id);
  }
}
