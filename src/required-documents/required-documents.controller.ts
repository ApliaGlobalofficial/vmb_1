import {
    Controller,
    Get,
    Post,
    Body,
    Param,
    Patch,
    Delete,
    ParseIntPipe,
    UseInterceptors,
    UploadedFile,
    InternalServerErrorException,
    NotFoundException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { RequiredDocumentsService } from './required-documents.service';

@Controller('required-documents')
export class RequiredDocumentsController {
    constructor(private readonly requiredDocumentsService: RequiredDocumentsService) { }

    @Post()
    @UseInterceptors(FileInterceptor('file')) // 'file' is the field name in the form-data
    async create(
        @Body('category_id', ParseIntPipe) categoryId: number,
        @Body('subcategory_id', ParseIntPipe) subcategoryId: number,
        @Body('document_names') documentNames: string,
        @UploadedFile() file: Express.Multer.File,
    ) {
        try {
            const result = await this.requiredDocumentsService.create(
                categoryId,
                subcategoryId,
                documentNames,
                file,
            );
            return result;
        } catch (error) {
            console.error('Error in create controller:', error);
            throw new InternalServerErrorException('Failed to create document.');
        }
    }

    @Get()
    async findAll() {
        return this.requiredDocumentsService.findAll();
    }

    @Get(':id')
    async findOne(@Param('id', ParseIntPipe) id: number) {
        return this.requiredDocumentsService.findOne(id);
    }

    @Patch(':id')
    @UseInterceptors(FileInterceptor('file')) // 'file' is the field name in the form-data
    async update(
        @Param('id', ParseIntPipe) id: number,
        @Body('category_id', ParseIntPipe) categoryId: number,
        @Body('subcategory_id', ParseIntPipe) subcategoryId: number,
        @Body('document_names') documentNames: string,
        @UploadedFile() file: Express.Multer.File,
    ) {
        try {
            const result = await this.requiredDocumentsService.update(
                id,
                categoryId,
                subcategoryId,
                documentNames,
                file,
            );
            return result;
        } catch (error) {
            console.error('Error in update controller:', error);
            throw new InternalServerErrorException('Failed to update document.');
        }
    }

    @Delete(':id')
    async remove(@Param('id', ParseIntPipe) id: number) {
        return this.requiredDocumentsService.remove(id);
    }

    @Get(':categoryId/:subcategoryId')
    async findByCategoryAndSubcategory(
        @Param('categoryId', ParseIntPipe) categoryId: number,
        @Param('subcategoryId', ParseIntPipe) subcategoryId: number,
    ) {
        return this.requiredDocumentsService.findByCategoryAndSubcategory(categoryId, subcategoryId);
    }
}