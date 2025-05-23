import { Injectable, NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Field } from './entities/feild.entity';

@Injectable()
export class FieldService {
    constructor(
        @InjectRepository(Field)
        private fieldRepository: Repository<Field>,
    ) { }

    // Add a new field (key)
    async addField(key: string): Promise<Field> {
        try {
            const field = this.fieldRepository.create({ key });
            await this.fieldRepository.save(field);
            return field;
        } catch (error) {
            console.error('Error in addField service:', error);
            throw new InternalServerErrorException('Failed to add field.');
        }
    }

    // Update an existing field (key)
    async updateField(id: number, key: string): Promise<Field> {
        try {
            const field = await this.fieldRepository.findOne({ where: { id } });
            if (!field) {
                throw new NotFoundException(`Field with ID "${id}" not found.`);
            }

            field.key = key;
            await this.fieldRepository.save(field);
            return field;
        } catch (error) {
            console.error('Error in updateField service:', error);
            if (error instanceof NotFoundException) {
                throw error;
            }
            throw new InternalServerErrorException('Failed to update field.');
        }
    }

    // Delete a field by ID
    async deleteField(id: number): Promise<void> {
        try {
            const field = await this.fieldRepository.findOne({ where: { id } });
            if (!field) {
                throw new NotFoundException(`Field with ID "${id}" not found.`);
            }

            await this.fieldRepository.delete(id);
        } catch (error) {
            console.error('Error in deleteField service:', error);
            if (error instanceof NotFoundException) {
                throw error;
            }
            throw new InternalServerErrorException('Failed to delete field.');
        }
    }

    // Get all fields (keys)
    async getAllFields(): Promise<Field[]> {
        try {
            return await this.fieldRepository.find();
        } catch (error) {
            console.error('Error in getAllFields service:', error);
            throw new InternalServerErrorException('Failed to fetch fields.');
        }
    }
}