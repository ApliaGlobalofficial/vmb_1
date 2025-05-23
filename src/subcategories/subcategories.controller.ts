import { Controller, Get, Post, Body, Param, Put, Delete, ParseIntPipe, Patch } from '@nestjs/common';
import { SubcategoriesService } from './subcategories.service';

@Controller('subcategories')
export class SubcategoriesController {
  constructor(private readonly subcategoriesService: SubcategoriesService) {}

  @Post()
  async create(@Body('category_id', ParseIntPipe) categoryId: number, @Body('subcategory_name') subcategoryName: string) {
    return this.subcategoriesService.create(categoryId, subcategoryName);
  }

  @Get()
  async findAll() {
    return this.subcategoriesService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) subcategoryId: number) {
    return this.subcategoriesService.findOne(subcategoryId);
  }

  @Get('category/:categoryId')
  async findByCategory(@Param('categoryId', ParseIntPipe) categoryId: number) {
    return this.subcategoriesService.findByCategory(categoryId);
  }

  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) subcategoryId: number,
    @Body('subcategory_name') subcategoryName: string,
  ) {
    return this.subcategoriesService.update(subcategoryId, subcategoryName);
  }

  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) subcategoryId: number) {
    return this.subcategoriesService.remove(subcategoryId);
  }
}
