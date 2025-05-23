import { Injectable, NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Certificate } from '../certificates/entities/certificates.entity';
import { S3 } from 'aws-sdk';
import * as archiver from 'archiver';
import { Response } from 'express';
import * as path from 'path';

@Injectable()
export class DownloadCertificateService {
  private s3 = new S3();

  constructor(
    @InjectRepository(Certificate)
    private certificateRepository: Repository<Certificate>,
  ) {}

  async downloadCertificates(documentId: number, res: Response) {
    // 1️⃣ Fetch Certificates from Database
    const certificates = await this.certificateRepository.find({ where: { document_id: documentId } });

    if (!certificates || certificates.length === 0) {
      throw new NotFoundException('No certificates found for the provided document ID');
    }

    // 2️⃣ Use the First User's Name for the ZIP File Name
    const userName = certificates[0].certificate_name.replace(/\s+/g, '_');
    const zipFileName = `${userName}.zip`;

    // 3️⃣ Set Response Headers for ZIP Download
    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', `attachment; filename=${zipFileName}`);

    // 4️⃣ Initialize Archiver for ZIP Creation
    const archive = archiver('zip', { zlib: { level: 9 } });
    archive.pipe(res);

    try {
      // 5️⃣ Fetch Files from S3 and Append to ZIP
      for (const certificate of certificates) {
        let s3Key = certificate.file_url.trim();

        // Extract only the object key from the full S3 URL
        const s3Bucket = 'vendorpunam';
        const baseUrl = `https://${s3Bucket}.s3.ap-south-1.amazonaws.com/`;

        if (s3Key.startsWith(baseUrl)) {
          s3Key = s3Key.replace(baseUrl, '');
        }

        try {
          const s3Object = await this.s3.getObject({
            Bucket: s3Bucket,
            Key: s3Key,
          }).promise();

          if (s3Object.Body) {
            // Extract file extension from the S3 key
            const fileExtension = path.extname(s3Key) || '';

            // Name the file as certificate_type + extension (e.g., certificate.pdf)
            const fileName = `${certificate.application_id}${fileExtension}`;

            archive.append(s3Object.Body as Buffer, { name: fileName });
          } else {
            console.warn(`⚠️ Skipped empty file from S3: ${s3Key}`);
          }
        } catch (err) {
          console.error(`❌ Error fetching file from S3: ${s3Key}`, err);
        }
      }

      // 6️⃣ Finalize the ZIP after All Files Are Appended
      archive.finalize();

      // 7️⃣ Handle ZIP Completion
      archive.on('end', () => {
        console.log('✅ ZIP file has been sent successfully.');
      });

      // 8️⃣ Handle Archiver Warnings
      archive.on('warning', (err) => {
        if (err.code === 'ENOENT') {
          console.warn('⚠️ Archiver Warning:', err.message);
        } else {
          throw err;
        }
      });

      // 9️⃣ Handle Archiver Errors
      archive.on('error', (err) => {
        console.error('❌ Archiver Error:', err);
        throw new InternalServerErrorException('Failed to create ZIP archive');
      });

    } catch (err) {
      console.error('❌ Error during download process:', err);
      throw new InternalServerErrorException('Failed to download certificates');
    }
  }
}
