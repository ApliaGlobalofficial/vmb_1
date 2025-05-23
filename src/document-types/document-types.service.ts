import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DocumentType } from './entities/document-type/document-type.entity.';
import { CreateDocumentTypeDto } from './dto/document-type.dto';
@Injectable()
export class DocumentTypesService {
    constructor(
        @InjectRepository(DocumentType)
        private readonly documentTypeRepository: Repository<DocumentType>,
    ) { }

    async create(createDocumentTypeDto: CreateDocumentTypeDto) {
        const documentType = this.documentTypeRepository.create(createDocumentTypeDto);
        return this.documentTypeRepository.save(documentType);
    }

    async findAll() {
        return this.documentTypeRepository.find();
    }

    async findOne(id: number) {
        return this.documentTypeRepository.findOne({ where: { doc_type_id: id } });
    }

    async update(id: number, updateDocumentTypeDto: CreateDocumentTypeDto) {
        await this.documentTypeRepository.update(id, updateDocumentTypeDto);
        return this.findOne(id);
    }

    async remove(id: number) {
        return this.documentTypeRepository.delete(id);
    }
}
