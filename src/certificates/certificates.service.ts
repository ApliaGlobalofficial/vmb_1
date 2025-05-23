import { Injectable, BadRequestException, InternalServerErrorException, NotFoundException, UseInterceptors, UploadedFile, Post, Body, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Certificate } from './entities/certificates.entity';
import { S3Service } from './s3.service';
import { Express } from 'express';
import { FileInterceptor } from '@nestjs/platform-express';

@Injectable()
export class CertificatesService {
  certificatesService: any;
  constructor(
    @InjectRepository(Certificate)
    private readonly certificateRepository: Repository<Certificate>,
    private readonly s3Service: S3Service
  ) { }

  async uploadReceipt(receiptFile: Express.Multer.File, documentId: string) {
    try {
      console.log('📂 Received Receipt File:', receiptFile);
      console.log('📄 Document ID:', documentId);

      if (!receiptFile) {
        throw new BadRequestException('Receipt file is required.');
      }

      const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
      if (!allowedMimeTypes.includes(receiptFile.mimetype)) {
        throw new BadRequestException('Only JPG, PNG, WEBP, and PDF files are allowed.');
      }

      // Convert `documentId` to a number
      const documentIdNumber = parseInt(documentId, 10);
      if (isNaN(documentIdNumber)) {
        throw new BadRequestException('Invalid document_id. Must be a valid number.');
      }

      // ✅ Upload receipt file to S3 and get URL
      const receiptUrl = await this.s3Service.uploadFile(receiptFile);

      // ✅ Check if a receipt already exists for the given document_id
      const existingReceipt = await this.certificateRepository.findOne({
        where: { document_id: documentIdNumber },
      });

      if (existingReceipt) {
        // If a receipt exists, update it
        await this.certificateRepository.update(
          { document_id: documentIdNumber },
          { receipt_url: receiptUrl },
        );
      } else {
        // If no receipt exists, create a new one
        await this.certificateRepository.save({
          document_id: documentIdNumber,
          receipt_url: receiptUrl,
        });
      }

      console.log('✅ Receipt URL updated/created successfully for document ID:', documentIdNumber);
      return { message: 'Receipt uploaded successfully' };
    } catch (error) {
      console.error('❌ Error saving receipt:', error);
      throw new InternalServerErrorException(`Failed to process receipt upload: ${error.message}`);
    }
  }
  async uploadCertificate(file: Express.Multer.File, body: any) {
    try {
      console.log('📂 Received File:', file);
      console.log('📝 Received Body:', body);

      if (!file) {
        throw new BadRequestException('File is required.');
      }

      const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
      if (!allowedMimeTypes.includes(file.mimetype)) {
        throw new BadRequestException('Only JPG, PNG, WEBP, and PDF files are allowed.');
      }

      // ✅ Upload file to S3 and get URL
      const fileUrl = await this.s3Service.uploadFile(file);

      // ✅ Ensure user_id and document_id are valid numbers
      const userId = body.user_id ? Number(body.user_id) : null;
      const documentId = body.document_id ? Number(body.document_id) : null;

      if (!userId || !documentId) {
        throw new BadRequestException('User ID and Document ID are required and must be valid numbers.');
      }

      // ✅ Ensure distributor_id is stored as the correct type
      const distributorId = body.distributor_id ? String(body.distributor_id) : undefined;

      const applicationId = body.application_id ? String(body.application_id) : null;
      const name = body.name ? String(body.name) : null;

      if (!applicationId || !name) {
        throw new BadRequestException('Application ID and Name are required.');
      }

      // Check if a certificate with the same application_id already exists
      const existingCertificate = await this.certificateRepository.findOne({
        where: { application_id: applicationId },
      });

      if (existingCertificate) {
        // If the certificate already exists, skip insertion and return a message
        return {
          message: 'Certificate with this application ID already exists. Skipping insertion.',
          certificate: existingCertificate,
        };
      } else {
        // ✅ Create a new certificate object
        const certificate = this.certificateRepository.create({
          certificate_name: body.certificate_name || 'Certificate',
          user_id: userId,
          document_id: documentId,
          distributor_id: distributorId,
          file_url: fileUrl,
          application_id: applicationId,
          name: name,
        });

        // ✅ Save the certificate in the database
        const savedCertificate = await this.certificateRepository.save(certificate);
        console.log('✅ Certificate saved successfully:', savedCertificate);

        return { message: 'Upload successful', certificate: savedCertificate };
      }
    } catch (error) {
      console.error('❌ Error saving certificate:', error);
      throw new InternalServerErrorException('Failed to process certificate upload');
    }
  }



  // ✅ Fetch a single document by certificate_id
  async getDocumentById(certificateId: string) {
    const id = Number(certificateId); // Convert to number

    if (isNaN(id)) {
      throw new BadRequestException('Invalid certificate ID');
    }

    const document = await this.certificateRepository.findOne({
      where: { certificate_id: id }, // Use number type
    });

    if (!document) {
      throw new NotFoundException(`Certificate with ID ${certificateId} not found`);
    }

    return document;
  }

  // ✅ Fetch all documents
  async getAllDocuments() {
    return await this.certificateRepository.find();
  }


  async getCertificatesByDocumentId(documentId: string) {
    const id = Number(documentId); // Convert to number

    if (isNaN(id)) {
      throw new BadRequestException('Invalid document ID');
    }

    const certificates = await this.certificateRepository.find({
      where: { document_id: id },
    });

    if (!certificates.length) {
      throw new NotFoundException(`No certificates found for document ID ${documentId}`);
    }

    return certificates;
  }


  async getCertificateByApplicationId(
    applicationId: string,
  ): Promise<{ certificate_url: string; application_id: string }> {
    // 1) find the document row
    const doc = await this.certificateRepository.findOne({
      where: { application_id: applicationId },
      select: ['document_id', 'application_id'],
    });
    if (!doc) {
      throw new NotFoundException(
        `Document with application_id=${applicationId} not found`,
      );
    }

    // 2) find the certificate row
    const cert = await this.certificateRepository.findOne({
      where: { document_id: doc.document_id },
      select: ['file_url'],
    });
    if (!cert?.file_url) {
      throw new NotFoundException(
        `Certificate for application_id=${applicationId} not found`,
      );
    }

    // 3) return in the same shape as your receipt endpoint
    return {
      certificate_url: cert.file_url,
      application_id: doc.application_id,
    };
  }
  async updateCertificateFile(documentId: string, file: Express.Multer.File) {
    const id = Number(documentId);

    if (isNaN(id)) {
      throw new BadRequestException('Invalid document ID.');
    }

    // ✅ Find the certificate by document ID
    const certificate = await this.certificateRepository.findOne({ where: { document_id: id } });

    if (!certificate) {
      throw new NotFoundException(`Certificate with Document ID ${documentId} not found.`);
    }

    // ✅ Validate file type
    const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
    if (!allowedMimeTypes.includes(file.mimetype)) {
      throw new BadRequestException('Only JPG, PNG, WEBP, and PDF files are allowed.');
    }

    // ✅ Upload new file to S3
    const newFileUrl = await this.s3Service.uploadFile(file);

    // ✅ Update the certificate's file_url
    certificate.file_url = newFileUrl;

    // ✅ Save the updated certificate
    const updatedCertificate = await this.certificateRepository.save(certificate);

    console.log('✅ Certificate updated successfully:', updatedCertificate);

    return { message: 'Certificate file updated successfully.', certificate: updatedCertificate };
  }

}
