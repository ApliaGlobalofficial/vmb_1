import {
  Controller,
  Post,
  Get,
  Param,
  UseInterceptors,
  UploadedFile,
  Body,
  BadRequestException,
  InternalServerErrorException,
  Patch,
  Put,
  NotFoundException
} from '@nestjs/common';
import { CertificatesService } from './certificates.service';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('certificates')
export class CertificatesController {
  constructor(private readonly certificatesService: CertificatesService) { }

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))

  async uploadCertificate(@UploadedFile() file: Express.Multer.File, @Body() body: any) {
    try {
      console.log('📂 Received File:', file);
      console.log('📝 Received Body:', body);

      if (!file) {
        throw new BadRequestException('File is required.');
      }

      return await this.certificatesService.uploadCertificate(file, body);
    } catch (error) {
      console.error('❌ Controller Error:', error);
      throw new InternalServerErrorException('Failed to upload certificate.');
    }
  }
  @Put('upload-receipt/:documentId')
  @UseInterceptors(FileInterceptor('receipt'))
  async uploadReceipt(
    @UploadedFile() receiptFile: Express.Multer.File,
    @Param('documentId') documentId: string,
  ) {
    return this.certificatesService.uploadReceipt(receiptFile, documentId);
  }

  // ✅ Fetch a single document by certificate_id
  @Get(':certificate_id')
  async getDocumentById(@Param('certificate_id') certificateId: string) {
    return this.certificatesService.getDocumentById(certificateId);
  }

  // ✅ Fetch all documents
  @Get()
  async getAllDocuments() {
    return this.certificatesService.getAllDocuments();
  }


  @Get('document/:documentId')
  async getCertificatesByDocumentId(@Param('documentId') documentId: string) {
    return this.certificatesService.getCertificatesByDocumentId(documentId);
  }


  @Get('certificate/:applicationId')
  async getCertificateByApplicationId(
    @Param('applicationId') applicationId: string,
  ) {
    try {
      return await this.certificatesService.getCertificateByApplicationId(
        applicationId,
      );
    } catch (err) {
      if (err instanceof NotFoundException) throw err;
      console.error('❌ Error in controller:', err);
      throw new InternalServerErrorException(
        'Failed to fetch certificate by application_id',
      );
    }
  }


  @Patch('update/:documentId')
  @UseInterceptors(FileInterceptor('file'))
  async updateCertificateFile(
    @Param('documentId') documentId: string,
    @UploadedFile() file: Express.Multer.File
  ) {
    try {
      if (!file) {
        throw new BadRequestException('File is required for update.');
      }

      return await this.certificatesService.updateCertificateFile(documentId, file);
    } catch (error) {
      console.error('❌ Update Controller Error:', error);
      throw new InternalServerErrorException('Failed to update certificate file.');
    }
  }

}
