import { Controller, Get, Param, Res } from '@nestjs/common';
import { Response } from 'express';
import { DownloadCertificateService } from './download-certificate.service';

@Controller('download-certificate')
export class DownloadCertificateController {
  constructor(private readonly downloadService: DownloadCertificateService) {}

  @Get(':document_id')
  async downloadCertificates(@Param('document_id') documentId: number, @Res() res: Response) {
    return this.downloadService.downloadCertificates(documentId, res);
  }
}
