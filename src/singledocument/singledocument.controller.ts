import { Controller, Get, Param, InternalServerErrorException } from '@nestjs/common';
import { SingleDocumentService } from './singledocument.service';

@Controller('singledocument')
export class SingleDocumentController {
  constructor(private readonly singleDocumentService: SingleDocumentService) {}

  @Get('documentby/:id')
  async getDocumentById(@Param('id') id: number) {
    try {
      return await this.singleDocumentService.getDocumentById(Number(id));
    } catch (error) {
      console.error('❌ Error fetching document:', error);
      throw new InternalServerErrorException('Failed to fetch document');
    }
  }
}
