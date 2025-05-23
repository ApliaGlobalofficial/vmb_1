import { Injectable, NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Document } from '../documents/entities/documents.entity';
import { S3 } from 'aws-sdk';
import * as archiver from 'archiver';
import { Response } from 'express';
import * as path from 'path';
import { Certificate } from 'src/certificates/entities/certificates.entity';
import { ConfigService } from '@nestjs/config'; // ✅ Import ConfigService

@Injectable()
export class DownloadService {
  private s3 = new S3();
  private s3Bucket: string;
  constructor(
    @InjectRepository(Document)
    private documentRepository: Repository<Document>,

    @InjectRepository(Certificate)
    private certificateRepository: Repository<Certificate>,

    private readonly configService: ConfigService, // ✅ Inject ConfigService
  ) {
    this.s3Bucket = this.configService.get<string>('AWS_S3_BUCKET_NAME') || 'default-bucket-name';
  }

  async allDocuments(documentId: number, res: Response) {
    try {
      // 1️⃣ Fetch Document, Receipts, and Certificates from Database
      const document = await this.documentRepository.findOne({ where: { document_id: documentId } });
      if (!document) {
        throw new NotFoundException('Document not found');
      }

      // Fetch receipts associated with the document
      const receipts = await this.documentRepository.find({ where: { document_id: documentId } });

      // Fetch certificates associated with the document
      const certificates = await this.certificateRepository.find({ where: { document_id: documentId } });

      // 2️⃣ Extract APPLICANT NAME from document_fields
      const documentFields = document.document_fields; // Assuming document_fields is a JSON array
      let applicantName = 'Unknown_Applicant'; // Default value if APPLICANT NAME is not found

      if (Array.isArray(documentFields)) {
        const applicantField = documentFields.find(
          (field) => field.field_name === 'APPLICANT NAME',
        );
        if (applicantField) {
          applicantName = applicantField.field_value;
        } else {
          // Fallback to document.name if APPLICANT NAME is not found
          applicantName = document.name || 'Unknown_Applicant';
        }
      }

      // 3️⃣ Setup Response Headers for ZIP Download
      const zipFileName = `${applicantName.replace(/\s+/g, '_')}.zip`; // Use APPLICANT NAME for the ZIP file name
      res.setHeader('Content-Type', 'application/zip');
      res.setHeader('Content-Disposition', `attachment; filename=${zipFileName}`);

      // 4️⃣ Initialize Archiver for ZIP Creation
      const archive = archiver('zip', { zlib: { level: 9 } });

      // Set up event handlers BEFORE piping and adding files
      archive.on('warning', (err) => {
        if (err.code === 'ENOENT') {
          console.warn('⚠️ Archiver Warning:', err.message);
        } else {
          console.error('❌ Archiver Warning:', err);
        }
      });

      archive.on('error', (err) => {
        console.error('❌ Archiver Error:', err);
        throw new InternalServerErrorException('Failed to create ZIP archive');
      });

      archive.on('end', () => {
        console.log('✅ ZIP file has been sent successfully.');
      });

      // Now pipe the archive to the response
      archive.pipe(res);

      // 5️⃣ Add Documents to ZIP
      if (document.documents && document.documents.length > 0) {
        for (const doc of document.documents) {
          console.log("Processing document:", doc);
          await this.addFileToZip(archive, doc.file_path, 'documents/', `Document_${doc.document_type}`);
        }
      }

      // 6️⃣ Add Receipts to ZIP
      if (receipts && receipts.length > 0) {
        for (const [index, receipt] of receipts.entries()) {
          console.log("Processing receipt:", receipt);
          // Use the index as a unique identifier for the file name
          const fileNamePrefix = `Receipt_${index + 1}`; // e.g., Receipt_1, Receipt_2, etc.
          await this.addFileToZip(archive, receipt.receipt_url, 'receipts/', fileNamePrefix);
        }
      }

      // 7️⃣ Add Certificates to ZIP
      if (certificates && certificates.length > 0) {
        for (const certificate of certificates) {
          console.log("Processing certificate:", certificate);
          await this.addFileToZip(archive, certificate.file_url, 'certificates/', `Certificate_${certificate.application_id}`);
        }
      }

      // 8️⃣ Finalize the ZIP after All Files Are Appended
      await archive.finalize();

    } catch (err) {
      console.error('❌ Error during download process:', err);

      // Make sure we don't try to modify headers if they're already sent
      if (!res.headersSent) {
        if (err instanceof NotFoundException) {
          res.status(404).json({ message: err.message });
        } else {
          res.status(500).json({ message: 'Failed to download documents, receipts, and certificates' });
        }
      } else {
        // If headers are already sent, we need to end the response
        res.end();
      }
    }
  }

  async addFileToZip(archive: archiver.Archiver, fileUrl: string, folderPath: string, fileNamePrefix: string) {
    const s3Bucket = this.s3Bucket;
    let s3Key = fileUrl.trim();

    // Extract only the object key from the full S3 URL
    const baseUrl1 = `https://${s3Bucket}.s3.ap-south-1.amazonaws.com/`;
    const baseUrl2 = `https://s3.ap-south-1.amazonaws.com/${s3Bucket}/`;

    if (s3Key.startsWith(baseUrl1)) {
      s3Key = s3Key.replace(baseUrl1, '');
    } else if (s3Key.startsWith(baseUrl2)) {
      s3Key = s3Key.replace(baseUrl2, '');
    }

    // Decode URL-encoded characters (e.g., %20 for spaces)
    s3Key = decodeURIComponent(s3Key);

    // Remove any trailing slashes or duplicate segments
    s3Key = s3Key.replace(/\/+/g, '/').replace(/^\//, '').replace(/\/$/, '');

    console.log(`Attempting to fetch file with S3 key: ${s3Key}`);

    try {
      // Check if the file exists in S3
      await this.s3.headObject({ Bucket: s3Bucket, Key: s3Key }).promise();

      // Fetch the file from S3
      const s3Object = await this.s3.getObject({ Bucket: s3Bucket, Key: s3Key }).promise();

      if (s3Object.Body) {
        // Extract file extension from the S3 key
        const fileExtension = path.extname(s3Key) || '';

        // Name the file and put it in the appropriate folder
        const fileName = `${folderPath}${fileNamePrefix}${fileExtension}`;

        archive.append(s3Object.Body as Buffer, { name: fileName });
      } else {
        console.warn(`⚠️ Skipped empty file from S3: ${s3Key}`);
      }
    } catch (err) {
      if (err.code === 'NoSuchKey' || err.code === 'NotFound') {
        console.error(`❌ File not found in S3: ${s3Key}`);
      } else {
        console.error(`❌ Error fetching file from S3: ${s3Key}`, err);
      }
    }
  }
  async downloadDocuments(documentId: number, res: Response) {
    try {
      // 1️⃣ Fetch Document from Database
      const document = await this.documentRepository.findOne({ where: { document_id: documentId } });
      if (!document) {
        throw new NotFoundException('Document not found');
      }

      // Ensure documents is an array and has a valid length
      if (!Array.isArray(document.documents)) {
        throw new NotFoundException('Invalid documents format');
      }
      if (document.documents.length === 0) {
        throw new NotFoundException('No documents available for download');
      }

      // 2️⃣ Extract APPLICANT NAME from document_fields
      const documentFields = document.document_fields; // Assuming document_fields is a JSON array
      let applicantName = 'Unknown_Applicant'; // Default value if APPLICANT NAME is not found

      if (Array.isArray(documentFields)) {
        const applicantField = documentFields.find(
          (field) => field.field_name === 'APPLICANT NAME',
        );
        if (applicantField) {
          applicantName = applicantField.field_value;
        } else {
          // Fallback to previous_name if APPLICANT NAME is not found
          applicantName = document.name || 'Unknown_Applicant';
        }
      }

      // 3️⃣ Setup Response Headers for ZIP Download
      const zipFileName = `${applicantName.replace(/\s+/g, '_')}.zip`; // Use APPLICANT NAME for the ZIP file name
      res.setHeader('Content-Type', 'application/zip');
      res.setHeader('Content-Disposition', `attachment; filename=${zipFileName}`);

      // 4️⃣ Initialize Archiver for ZIP Creation
      const archive = archiver('zip', { zlib: { level: 9 } });

      // 5️⃣ Set up event handlers BEFORE piping and adding files
      archive.on('warning', (err) => {
        if (err.code === 'ENOENT') {
          console.warn('⚠️ Archiver Warning:', err.message);
        } else {
          console.error('❌ Archiver Warning:', err);
        }
      });

      archive.on('error', (err) => {
        console.error('❌ Archiver Error:', err);
        throw new InternalServerErrorException('Failed to create ZIP archive');
      });

      archive.on('end', () => {
        console.log('✅ ZIP file has been sent successfully.');
      });

      // Now pipe the archive to the response
      archive.pipe(res);

      // 6️⃣ Add Documents to ZIP
      if (Array.isArray(document.documents) && document.documents.length > 0) {
        for (const doc of document.documents) {
          console.log("Processing document:", doc);
          await this.FileToZip(archive, doc.file_path, 'documents/', `Document_${doc.document_type}`);
        }
      }

      // 7️⃣ Finalize the ZIP after All Files Are Appended
      await archive.finalize();

    } catch (err) {
      console.error('❌ Error during download process:', err);

      // Make sure we don't try to modify headers if they're already sent
      if (!res.headersSent) {
        if (err instanceof NotFoundException) {
          res.status(404).json({ message: err.message });
        } else {
          res.status(500).json({ message: 'Failed to download documents' });
        }
      } else {
        // If headers are already sent, we need to end the response
        res.end();
      }
    }
  }

  // Helper function to add files to the ZIP
  async FileToZip(archive: archiver.Archiver, fileUrl: string, folderPath: string, fileNamePrefix: string) {
    const s3Bucket = this.s3Bucket;
    let s3Key = fileUrl.trim();

    // Extract only the object key from the full S3 URL
    const baseUrl1 = `https://${s3Bucket}.s3.ap-south-1.amazonaws.com/`;
    const baseUrl2 = `https://s3.ap-south-1.amazonaws.com/${s3Bucket}/`;

    if (s3Key.startsWith(baseUrl1)) {
      s3Key = s3Key.replace(baseUrl1, '');
    } else if (s3Key.startsWith(baseUrl2)) {
      s3Key = s3Key.replace(baseUrl2, '');
    }

    // Decode URL-encoded characters (e.g., %20 for spaces)
    s3Key = decodeURIComponent(s3Key);

    // Remove any trailing slashes or duplicate segments
    s3Key = s3Key.replace(/\/+/g, '/').replace(/^\//, '').replace(/\/$/, '');

    console.log(`Attempting to fetch file with S3 key: ${s3Key}`);

    try {
      // Check if the file exists in S3
      await this.s3.headObject({ Bucket: s3Bucket, Key: s3Key }).promise();

      // Fetch the file from S3
      const s3Object = await this.s3.getObject({ Bucket: s3Bucket, Key: s3Key }).promise();

      if (s3Object.Body) {
        // Extract file extension from the S3 key
        const fileExtension = path.extname(s3Key) || '';

        // Name the file and put it in the appropriate folder
        const fileName = `${folderPath}${fileNamePrefix}${fileExtension}`;

        archive.append(s3Object.Body as Buffer, { name: fileName });
      } else {
        console.warn(`⚠️ Skipped empty file from S3: ${s3Key}`);
      }
    } catch (err) {
      if (err.code === 'NoSuchKey' || err.code === 'NotFound') {
        console.error(`❌ File not found in S3: ${s3Key}`);
      } else {
        console.error(`❌ Error fetching file from S3: ${s3Key}`, err);
      }
    }
  }
  // Helper function to add files to the ZIP
}