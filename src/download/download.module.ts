import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DownloadController } from './download.controller';
import { DownloadService } from './download.service';
import { Document } from '../documents/entities/documents.entity';
import { CertificatesController } from 'src/certificates/certificates.controller';
import { Certificate } from 'src/certificates/entities/certificates.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Document, Certificate]),
  ],
  controllers: [DownloadController],
  providers: [DownloadService],
})
export class DownloadModule { }
