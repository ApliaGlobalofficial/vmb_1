import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Subcategory } from './entities/subcategories.entity';
import { Category } from '../categories/entities/categories.entity';

@Injectable()
export class SubcategoriesService {
  constructor(
    @InjectRepository(Subcategory)
    private readonly subcategoryRepository: Repository<Subcategory>,
    
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
  ) {}

  async create(categoryId: number, subcategoryName: string): Promise<Subcategory> {
    const category = await this.categoryRepository.findOne({ where: { category_id: categoryId } });
    if (!category) {
      throw new NotFoundException('Category not found');
    }

    const subcategory = this.subcategoryRepository.create({ subcategory_name: subcategoryName, category });
    return this.subcategoryRepository.save(subcategory);
  }

  async findAll(): Promise<Subcategory[]> {
    return this.subcategoryRepository.find({ relations: ['category'] });
  }

  async findOne(subcategoryId: number): Promise<Subcategory> {
    const subcategory = await this.subcategoryRepository.findOne({
      where: { subcategory_id: subcategoryId },
      relations: ['category'],
    });
    if (!subcategory) {
      throw new NotFoundException('Subcategory not found');
    }
    return subcategory;
  }

  async findByCategory(categoryId: number): Promise<Subcategory[]> {
    const category = await this.categoryRepository.findOne({ where: { category_id: categoryId } });
    if (!category) {
      throw new NotFoundException('Category not found');
    }

    return this.subcategoryRepository.find({
      where: { category: { category_id: categoryId } },
      relations: ['category'],
    });
  }

  async update(subcategoryId: number, subcategoryName: string): Promise<Subcategory> {
    const subcategory = await this.findOne(subcategoryId);
    subcategory.subcategory_name = subcategoryName;
    return this.subcategoryRepository.save(subcategory);
  }
  

  async remove(subcategoryId: number): Promise<{ message: string }> {
    const subcategory = await this.findOne(subcategoryId);
    await this.subcategoryRepository.remove(subcategory);
    return { message: 'Subcategory deleted successfully' };
  }
}
