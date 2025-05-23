import { Controller, Get, Post, Put, Query, Delete, Param, Body, NotFoundException, ParseIntPipe, Patch } from '@nestjs/common';
import { FeildNamesService } from './feild_names.service';
import { FeildName } from './entities/feild_names.entity';

@Controller('field-names')
export class FeildNamesController {
    constructor(private readonly feildNamesService: FeildNamesService) { }

    @Post()
    async create(
        @Body('category_id', ParseIntPipe) categoryId: number,
        @Body('subcategory_id', ParseIntPipe) subcategoryId: number,
        @Body('document_fields') documentFeilds: string
    ): Promise<FeildName> {
        return await this.feildNamesService.create(categoryId, subcategoryId, documentFeilds);
    }







    @Get()
    async findAll(): Promise<FeildName[]> {
        return await this.feildNamesService.findAll();
    }

    @Get(':categoryId/:subcategoryId')
    async findByCategoryAndSubcategory(
        @Param('categoryId') categoryId: number,
        @Param('subcategoryId') subcategoryId: number
    ): Promise<FeildName[]> {
        const fieldNames = await this.feildNamesService.findByCategoryAndSubcategory(categoryId, subcategoryId);
        if (!fieldNames.length) {
            throw new NotFoundException(`No FieldNames found for categoryId ${categoryId} and subcategoryId ${subcategoryId}`);
        }
        return fieldNames;
    }

    @Patch(':id')
    async updateDocumentField(
      @Param('id') id: number,
      @Body('document_fields') documentFields: string
    ): Promise<FeildName> {
      return await this.feildNamesService.updateDocumentField(id, documentFields);
    }
    

    @Delete(':id')
    async remove(@Param('id', ParseIntPipe) id: number): Promise<{ message: string }> {
        await this.feildNamesService.remove(id);
        return { message: `FeildName with ID ${id} successfully deleted` };
    }
}
