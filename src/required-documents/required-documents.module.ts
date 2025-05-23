import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RequiredDocument } from './required-document.entity';
import { RequiredDocumentsService } from './required-documents.service';
import { RequiredDocumentsController } from './required-documents.controller';
import { S3Service } from './s3.service'; // Import S3Service
import { Category } from '../categories/entities/categories.entity'; // Import Category entity
import { Subcategory } from '../subcategories/entities/subcategories.entity'; // Import Subcategory entity

@Module({
    imports: [
        TypeOrmModule.forFeature([RequiredDocument, Category, Subcategory]), // Add Category and Subcategory here
    ],
    controllers: [RequiredDocumentsController],
    providers: [RequiredDocumentsService, S3Service], // Add S3Service to providers
})
export class RequiredDocumentsModule { }