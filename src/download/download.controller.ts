import { Controller, Get, InternalServerErrorException, NotFoundException, Param, Res } from '@nestjs/common';
import { Response } from 'express';
import { DownloadService } from './download.service';

@Controller('download')
export class DownloadController {
  constructor(private readonly downloadService: DownloadService) { }
  @Get(':document_id')
  async downloadDocuments(@Param('document_id') documentId: number, @Res() res: Response) {
    try {
      // Call the downloadDocuments method from the download service
      await this.downloadService.downloadDocuments(documentId, res);
    } catch (error) {
      console.error('❌ Error during document download:', error);

      // Handle specific error messages
      if (error instanceof NotFoundException) {
        res.status(404).json({ message: error.message });
      } else if (error instanceof InternalServerErrorException) {
        res.status(500).json({ message: error.message });
      } else {
        res.status(500).json({ message: 'Failed to download documents' });
      }
    }
  }
  @Get('all/:document_id')
  async allDocuments(@Param('document_id') documentId: number, @Res() res: Response) {
    try {
      // Call the downloadDocuments method from the download service
      await this.downloadService.allDocuments(documentId, res);
    } catch (error) {
      console.error('❌ Error during document download:', error);

      if (error instanceof NotFoundException) {
        res.status(404).json({ message: error.message });
      } else {
        res.status(500).json({ message: 'Failed to download documents' });
      }
    }
  }
}

