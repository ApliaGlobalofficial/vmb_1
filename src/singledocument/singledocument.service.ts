import { Injectable, NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Document } from '../documents/entities/documents.entity'; // Assuming your document entity path

@Injectable()
export class SingleDocumentService {
  constructor(
    @InjectRepository(Document)
    private documentRepository: Repository<Document>,
  ) {}

  async getDocumentById(id: number) {
    try {
      const document = await this.documentRepository.findOne({ where: { document_id: id } });

      if (!document) {
        throw new NotFoundException(`Document with ID ${id} not found`);
      }

      return {
        message: 'Document fetched successfully',
        document,
      };
    } catch (error) {
      console.error('❌ Error fetching document:', error);
      throw new InternalServerErrorException('Could not fetch document');
    }
  }
}
