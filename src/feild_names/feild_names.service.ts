import { Injectable, NotFoundException, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FeildName } from './entities/feild_names.entity';
import { Category } from 'src/categories/entities/categories.entity';
import { Subcategory } from 'src/subcategories/entities/subcategories.entity';

@Injectable()
export class FeildNamesService {
    getDocumentFields(categoryId: number, subcategoryId: number): string | PromiseLike<string> {
        throw new Error('Method not implemented.');
    }
    constructor(
        @InjectRepository(FeildName)
        private readonly feildNamesRepository: Repository<FeildName>,

        @InjectRepository(Category)
        private readonly categoryRepository: Repository<Category>,

        @InjectRepository(Subcategory)
        private readonly subcategoryRepository: Repository<Subcategory>,
    ) { }

    async create(categoryId: number, subcategoryId: number, documentFeilds: any): Promise<FeildName> {
        try {
            // Ensure documentFeilds is a valid string
            if (!documentFeilds || typeof documentFeilds !== 'string') {
                throw new BadRequestException('document_fields must be a valid string');
            }

            // Trim whitespace
            const trimmedFields = documentFeilds.trim();
            if (trimmedFields === '') {
                throw new BadRequestException('document_fields cannot be empty');
            }

            // Fetch Category & Subcategory in a single query
            const category = await this.categoryRepository.findOne({ where: { category_id: categoryId } });
            const subcategory = await this.subcategoryRepository.findOne({ where: { subcategory_id: subcategoryId } });

            if (!category) throw new NotFoundException('Category not found');
            if (!subcategory) throw new NotFoundException('Subcategory not found');

            // Create & save the entity
            const feildName = this.feildNamesRepository.create({
                category,
                subcategory,
                document_fields: trimmedFields,
            });

            return await this.feildNamesRepository.save(feildName);
        } catch (error) {
            console.error('Error in create method:', error.message);
            throw new InternalServerErrorException('Failed to create field name');
        }
    }

    async findAll(): Promise<FeildName[]> {
        return await this.feildNamesRepository.find({ relations: ['category', 'subcategory'] });
    }

    async findOne(id: number): Promise<FeildName | null> {
        const feildName = await this.feildNamesRepository.findOne({ where: { id }, relations: ['category', 'subcategory'] });
        if (!feildName) throw new NotFoundException(`FeildName with ID ${id} not found`);
        return feildName;
    }

    async updateDocumentField(id: number, documentFields: string): Promise<FeildName> {
        // Update only the document_fields column
        await this.feildNamesRepository.update(id, { document_fields: documentFields });
      
        // Fetch the updated record
        const updatedField = await this.feildNamesRepository.findOne({ where: { id } });
      
        if (!updatedField) {
          throw new NotFoundException(`FieldName with ID ${id} not found`);
        }
      
        return updatedField;
      }
      

    async findByCategoryAndSubcategory(categoryId: number, subcategoryId: number): Promise<FeildName[]> {
        const fieldNames = await this.feildNamesRepository.find({
            where: {
                category: { category_id: categoryId },
                subcategory: { subcategory_id: subcategoryId },
            },
            relations: ['category', 'subcategory'],
        });

        if (!fieldNames.length) {
            throw new NotFoundException(`No FieldNames found for categoryId ${categoryId} and subcategoryId ${subcategoryId}`);
        }

        return fieldNames;
    }

    async remove(id: number): Promise<void> {
        const feildName = await this.feildNamesRepository.findOne({ where: { id } });

        if (!feildName) {
            throw new NotFoundException(`FeildName with ID ${id} not found`);
        }

        await this.feildNamesRepository.delete(id);
    }
}
