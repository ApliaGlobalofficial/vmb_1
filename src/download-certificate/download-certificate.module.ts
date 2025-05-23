import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DownloadCertificateService } from './download-certificate.service';
import { DownloadCertificateController } from './download-certificate.controller';
import { Certificate } from '../certificates/entities/certificates.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Certificate])],
  controllers: [DownloadCertificateController],
  providers: [DownloadCertificateService],
})
export class DownloadCertificateModule {}
