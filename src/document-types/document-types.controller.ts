import { Controller, Get, Post, Body, Param, Delete, Put } from '@nestjs/common';
import { DocumentTypesService } from './document-types.service';
import { CreateDocumentTypeDto } from './dto/document-type.dto';
@Controller('document-types')
export class DocumentTypesController {
    constructor(private readonly documentTypesService: DocumentTypesService) { }

    @Post()
    create(@Body() createDocumentTypeDto: CreateDocumentTypeDto) {
        return this.documentTypesService.create(createDocumentTypeDto);
    }

    @Get()
    findAll() {
        return this.documentTypesService.findAll();
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.documentTypesService.findOne(+id);
    }

    @Put(':id')
    update(@Param('id') id: string, @Body() updateDocumentTypeDto: CreateDocumentTypeDto) {
        return this.documentTypesService.update(+id, updateDocumentTypeDto);
    }

    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.documentTypesService.remove(+id);
    }
}
