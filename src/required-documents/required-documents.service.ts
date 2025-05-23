import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RequiredDocument } from './required-document.entity';
import { Category } from '../categories/entities/categories.entity';
import { Subcategory } from '../subcategories/entities/subcategories.entity';
import { S3Service } from './s3.service';

@Injectable()
export class RequiredDocumentsService {
    constructor(
        @InjectRepository(RequiredDocument)
        private readonly requiredDocumentRepository: Repository<RequiredDocument>,

        @InjectRepository(Category)
        private readonly categoryRepository: Repository<Category>,

        @InjectRepository(Subcategory)
        private readonly subcategoryRepository: Repository<Subcategory>,
        private readonly s3Service: S3Service, // Inject the S3Service
    ) { }

    async create(
        categoryId: number,
        subcategoryId: number,
        documentNames: string,
        file: Express.Multer.File,
    ): Promise<{ document: RequiredDocument; fileUrl: string }> {
        try {
            // Step 1: Validate category and subcategory
            const category = await this.categoryRepository.findOne({ where: { category_id: categoryId } });
            if (!category) {
                throw new NotFoundException('Category not found');
            }

            const subcategory = await this.subcategoryRepository.findOne({ where: { subcategory_id: subcategoryId } });
            if (!subcategory) {
                throw new NotFoundException('Subcategory not found');
            }

            // Step 2: Create the RequiredDocument entry
            const requiredDocument = this.requiredDocumentRepository.create({
                category,
                subcategory,
                document_names: documentNames,
            });
            await this.requiredDocumentRepository.save(requiredDocument);

            // Step 3: Validate the file
            if (!file) {
                throw new BadRequestException('No file uploaded.');
            }

            // Step 4: Upload the file to S3
            const fileUrl = await this.s3Service.uploadFile(file);

            // Step 5: Update the file_url field in the RequiredDocument
            requiredDocument.file_url = fileUrl;
            await this.requiredDocumentRepository.save(requiredDocument);

            // Return the combined result
            return { document: requiredDocument, fileUrl };
        } catch (error) {
            console.error('Error in createAndUpload service:', error);
            throw new InternalServerErrorException('Failed to create and upload document.');
        }
    }

    async findAll(): Promise<RequiredDocument[]> {
        return this.requiredDocumentRepository.find({ relations: ['category', 'subcategory'] });
    }

    async findOne(id: number): Promise<RequiredDocument> {
        const requiredDocument = await this.requiredDocumentRepository.findOne({
            where: { id },
            relations: ['category', 'subcategory'],
        });
        if (!requiredDocument) {
            throw new NotFoundException('Required Document not found');
        }
        return requiredDocument;
    }

    async updateDocumentName(id: number, documentNames: string): Promise<RequiredDocument> {
        const requiredDocument = await this.findOne(id);
        requiredDocument.document_names = documentNames;
        return this.requiredDocumentRepository.save(requiredDocument);
    }

    async remove(id: number): Promise<{ message: string }> {
        const requiredDocument = await this.findOne(id);
        await this.requiredDocumentRepository.remove(requiredDocument);
        return { message: 'Required Document deleted successfully' };
    }

    async findByCategoryAndSubcategory(categoryId: number, subcategoryId: number): Promise<RequiredDocument[]> {
        return this.requiredDocumentRepository.find({
            where: {
                category: { category_id: categoryId },
                subcategory: { subcategory_id: subcategoryId },
            },
            relations: ['category', 'subcategory'],
        });
    }

    async update(
        id: number,
        categoryId: number,
        subcategoryId: number,
        documentNames: string,
        file: Express.Multer.File,
    ): Promise<{ document: RequiredDocument; fileUrl: string }> {
        try {
            // Step 1: Find the existing document
            const requiredDocument = await this.findOne(id);

            // Step 2: Validate category and subcategory
            const category = await this.categoryRepository.findOne({ where: { category_id: categoryId } });
            if (!category) {
                throw new NotFoundException('Category not found');
            }

            const subcategory = await this.subcategoryRepository.findOne({ where: { subcategory_id: subcategoryId } });
            if (!subcategory) {
                throw new NotFoundException('Subcategory not found');
            }

            // Step 3: Update the document fields
            requiredDocument.category = category;
            requiredDocument.subcategory = subcategory;
            requiredDocument.document_names = documentNames;

            // Step 4: If a file is provided, upload it and update the file URL
            if (file) {
                const fileUrl = await this.s3Service.uploadFile(file); // Upload the file to S3
                requiredDocument.file_url = fileUrl; // Update the file URL in the document
            }

            // Step 5: Save the updated document
            await this.requiredDocumentRepository.save(requiredDocument);

            // Return the updated document and file URL
            return { document: requiredDocument, fileUrl: requiredDocument.file_url };
        } catch (error) {
            console.error('Error in update service:', error);
            throw new InternalServerErrorException('Failed to update document.');
        }
    }
}