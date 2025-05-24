import { Injectable, BadRequestException, InternalServerErrorException, NotFoundException, Param, Get } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Document } from './entities/documents.entity';
import { Express } from 'express';
import { S3Service } from './s3.service';
import * as nodemailer from 'nodemailer';
import { IsNull, Not } from "typeorm";
import { PricesService } from "../prices/prices.service";
import { WalletService } from '../wallet/wallet.service';


@Injectable()
export class DocumentsService {
  constructor(
    @InjectRepository(Document)
    private readonly documentRepository: Repository<Document>,
    private readonly pricesService: PricesService,
    private readonly walletService: WalletService,
    private readonly s3Service: S3Service,
    private readonly dataSource: DataSource,
  ) { }

  async getAllDocuments() {
    try {
      const documents = await this.documentRepository.find();
      return { message: 'Documents fetched successfully', documents };
    } catch (error) {
      console.error('❌ Error fetching documents:', error);
      throw new InternalServerErrorException('Could not fetch documents');
    }
  }
  async getDocumentById(documentId: number) {
    return this.documentRepository.findOne({
      where: { document_id: documentId },
      select: ['document_id', 'status_history', 'category_id', 'subcategory_id'], // Only fetch necessary fields
    });
  }
  async getReceiptByApplicationId(
    applicationId: string,
  ): Promise<{ receipt_url: string; application_id: string }> {
    // TS infers `doc` as `Document | null`
    const doc = await this.documentRepository.findOne({
      where: { application_id: applicationId },
      select: ['receipt_url', 'documents', 'application_id'],
    });

    if (!doc) {
      throw new NotFoundException(
        `Document with application_id=${applicationId} not found`,
      );
    }

    // Now `doc` is guaranteed non-null, so you can safely access its fields:
    if (doc.receipt_url) {
      return { receipt_url: doc.receipt_url, application_id: doc.application_id };
    }

    if (Array.isArray(doc.documents)) {
      const entry = doc.documents.find(
        (d) => d.is_receipt_url === true || d.document_type === 'receipt',
      );
      if (entry?.file_path) {
        return {
          receipt_url: entry.file_path,
          application_id: doc.application_id,
        };
      }
    }

    throw new NotFoundException(
      `No receipt found for application_id=${applicationId}`,
    );
  }


  async getAllDocumentsNoDistributor() {
    try {
      const documents = await this.documentRepository.find({
        where: { distributor_id: IsNull() }, // Fetch only documents where distributor_id is NULL
      });
      return { message: 'Documents fetched successfully', documents };
    } catch (error) {
      console.error('❌ Error fetching documents:', error);
      throw new InternalServerErrorException('Could not fetch documents');
    }
  }


  async getAssignedDocuments() {
    try {
      const assignedDocuments = await this.documentRepository.find({
        where: { distributor_id: Not(IsNull()) }, // Fetch only assigned applications
        order: { uploaded_at: 'DESC' }, // Sort by uploaded_at in descending order
      });

      return {
        message: 'Assigned Documents fetched successfully',
        documents: assignedDocuments
      };
    } catch (error) {
      console.error('❌ Error fetching assigned documents:', error);
      throw new InternalServerErrorException('Could not fetch assigned documents');
    }
  }
  // async updateDocumentStatus(
  //   documentId: number,
  //   status: string,
  //   rejectionReason?: string,
  //   selectedDocumentNames?: string[],
  // ) {
  //   try {
  //     console.log('🔍 Finding document with ID:', documentId);
  //     // Find the document in the database
  //     const document = await this.documentRepository.findOne({
  //       where: { document_id: documentId },
  //     });
  //     if (!document) {
  //       throw new BadRequestException('Document not found.');
  //     }
  //     console.log('📄 Document before update:', JSON.stringify(document, null, 2));
  //     if (document.status === 'Completed') {
  //       const docId = await this.pricesService.findByCatIdAndSubCatId(document.category_id, document.subcategory_id);
  //       if (!docId) {
  //         throw new BadRequestException('Document ID not found.');
  //       }
  //       console.log('📄 Document before update: doc id ', JSON.stringify(docId));
  //       const adminWallet = await this.walletService.findWalletByUserId(5);
  //       if (!adminWallet) {
  //         throw new Error('Admin wallet not found');
  //       }
  //       console.log(`adminWallet: ${JSON.stringify(adminWallet)}`);

  //       const adminSubAmount = await this.walletService.subtractWalletBalance(5, Number(docId.distributable_amount));
  //       if (!adminSubAmount) {
  //         throw new Error('Admin wallet balance not updated');
  //       }
  //       const distributorWallet = await this.walletService.findWalletByUserId(Number(document.distributor_id));
  //       console.log(`distributorWallet: ${JSON.stringify(distributorWallet)}`);

  //       if (!distributorWallet) {
  //         throw new Error('Distributor wallet not found');
  //       }
  //       const destributorAmount = await this.walletService.addWalletBalance(Number(distributorWallet.userId), Number(docId.distributable_amount));
  //       console.log(`destributerrrr: ${JSON.stringify(destributorAmount)}`);

  //       if (!destributorAmount) {
  //         throw new Error('Distributor wallet balance not updated');
  //       }
  //     }
  //     // Update the document status
  //     document.status = status;

  //     // Add a new entry to the status_history array
  //     document.status_history = document.status_history || []; // Initialize if null
  //     document.status_history.push({
  //       status: status, // Current status
  //       updated_at: new Date(), // Current timestamp
  //     });
  //     console.log('✅ Updated status_history:', document.status_history);

  //     // Handle rejection reason, selected document names, and other status-specific logic
  //     if (status === 'Rejected') {
  //       // Validate rejection reason (required for "Rejected" status)
  //       if (!rejectionReason?.trim()) {
  //         throw new BadRequestException('Rejection reason is required for Rejected status.');
  //       }

  //       // Save rejection reason
  //       document.rejection_reason = rejectionReason;
  //       console.log('✅ Saved rejection reason:', rejectionReason);

  //       // Save selected document names if provided
  //       if (selectedDocumentNames) {
  //         document.selected_document_names = selectedDocumentNames;
  //         console.log('✅ Saved selected document names:', selectedDocumentNames.join(', '));
  //       }
  //     } else if (status === 'Uploaded') {
  //       // Save selected document names if provided
  //       if (selectedDocumentNames) {
  //         document.selected_document_names = selectedDocumentNames;
  //         console.log('✅ Saved selected document names:', selectedDocumentNames.join(', '));
  //       }
  //     } else if (status === 'Sent') {
  //       // Handle logic for "Sent" status
  //       console.log('✅ Document status updated to "Sent".');
  //       // You can add additional logic here if needed, such as sending an email notification.
  //     } else if (status === 'Received') {
  //       // Handle logic for "Received" status
  //       console.log('✅ Document status updated to "Received".');
  //       // You can add additional logic here if needed, such as sending an email notification.
  //     } else {
  //       // For all other statuses, preserve the existing values
  //       console.log('⚠️ Status is neither "Rejected", "Uploaded", "Sent", nor "Received". Preserving existing values.');
  //     }

  //     // Log the document after update
  //     console.log('📄 Document after update:', JSON.stringify(document, null, 2));

  //     // Save the updated document
  //     const updatedDocument = await this.documentRepository.save(document);
  //     console.log('✅ Document status updated successfully for document ID:', documentId);

  //     // Send email based on the updated status
  //     if (status === 'Rejected') {
  //       const reason = rejectionReason || 'No reason provided'; // Provide a default value
  //       await this.sendStatusRejectedEmail(updatedDocument, reason);
  //       console.log('📧 Rejection email sent for document ID:', documentId);
  //     } else if (status === 'Uploaded') {
  //       await this.sendStatusUploadedEmail(updatedDocument);
  //       console.log('📧 Upload confirmation email sent for document ID:', documentId);
  //     } else if (status === 'Sent') {
  //       // Send email notification for "Sent" status if required
  //       console.log('📧 Sent confirmation email sent for document ID:', documentId);
  //     } else if (status === 'Received') {
  //       // Send email notification for "Received" status if required
  //       console.log('📧 Received confirmation email sent for document ID:', documentId);
  //     }

  //     // Return success response
  //     return {
  //       message: 'Status updated successfully',
  //       document: updatedDocument,
  //     };
  //   } catch (error) {
  //     // Log the error
  //     console.error('❌ Error updating status:', error.stack);

  //     // Handle specific errors
  //     if (error instanceof BadRequestException) {
  //       throw error; // Re-throw BadRequestException as is
  //     }

  //     // Throw a generic error for other cases
  //     throw new InternalServerErrorException('Could not update document status');
  //   }
  // }

  // async updateDocumentStatus(
  //   documentId: number,
  //   status: string,
  //   rejectionReason?: string,
  //   selectedDocumentNames?: string[],
  // ) {
  //   try {
  //     console.log('🔍 Finding document with ID:', documentId);
  //     const document = await this.documentRepository.findOne({
  //       where: { document_id: documentId },
  //     });

  //     if (!document) {
  //       throw new BadRequestException('Document not found.');
  //     }

  //     console.log('📄 Document before update:', JSON.stringify(document, null, 2));

  //     // Update the document status
  //     document.status = status;

  //     // Handle rejection reason and selected document names based on status
  //     if (status === 'Rejected') {
  //       // Validate rejection reason (required for "Rejected" status)
  //       if (!rejectionReason?.trim()) {
  //         throw new BadRequestException('Rejection reason is required for Rejected status.');
  //       }

  //       // Save rejection reason
  //       document.rejection_reason = rejectionReason;
  //       console.log('✅ Saved rejection reason:', rejectionReason);

  //       // Save selected document names if provided
  //       if (selectedDocumentNames) {
  //         document.selected_document_names = selectedDocumentNames;
  //         console.log('✅ Saved selected document names:', selectedDocumentNames.join(', '));
  //       }
  //     } else if (status === 'Uploaded') {
  //       // Save selected document names if provided
  //       if (selectedDocumentNames) {
  //         document.selected_document_names = selectedDocumentNames;
  //         console.log('✅ Saved selected document names:', selectedDocumentNames.join(', '));
  //       }
  //     } else {
  //       // For all other statuses, preserve the existing values
  //       console.log('⚠️ Status is neither "Rejected" nor "Uploaded". Preserving existing values.');
  //     }

  //     // Log the document after update
  //     console.log('📄 Document after update:', JSON.stringify(document, null, 2));

  //     // Save the updated document
  //     const updatedDocument = await this.documentRepository.save(document);
  //     console.log('✅ Document status updated successfully for document ID:', documentId);

  //     // Send email based on the updated status
  //     if (status === 'Rejected') {
  //       const reason = rejectionReason || 'No reason provided'; // Provide a default value
  //       await this.sendStatusRejectedEmail(updatedDocument, reason);
  //       console.log('📧 Rejection email sent for document ID:', documentId);
  //     } else if (status === 'Uploaded') {
  //       await this.sendStatusUploadedEmail(updatedDocument);
  //       console.log('📧 Upload confirmation email sent for document ID:', documentId);
  //     }

  //     // Return success response
  //     return {
  //       message: 'Status updated successfully',
  //       document: updatedDocument,
  //     };
  //   } catch (error) {
  //     // Log the error
  //     console.error('❌ Error updating status:', error.stack);

  //     // Handle specific errors
  //     if (error instanceof BadRequestException) {
  //       throw error; // Re-throw BadRequestException as is
  //     }

  //     // Throw a generic error for other cases
  //     throw new InternalServerErrorException('Could not update document status');
  //   }
  // }

  // In your DocumentsService:

  async updateDocumentStatus(
    documentId: number,
    status: string,
    rejectionReason?: string,
    selectedDocumentNames?: string[],
  ) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // 1) Load the document within the transaction
      const document = await queryRunner.manager.findOne(Document, { where: { document_id: documentId } });
      if (!document) {
        throw new BadRequestException('Document not found.');
      }

      // 2) Append to status history
      document.status_history = document.status_history || [];
      document.status_history.push({ status, updated_at: new Date() });

      // 3) Handle rejection
      if (status === 'Rejected') {
        if (!rejectionReason?.trim()) {
          throw new BadRequestException('Rejection reason is required for Rejected status.');
        }
        document.rejection_reason = rejectionReason;
        if (selectedDocumentNames) {
          document.selected_document_names = selectedDocumentNames;
        }
      }

      // 4) Handle uploaded
      if (status === 'Uploaded' && selectedDocumentNames) {
        document.selected_document_names = selectedDocumentNames;
      }

      // 5) On “Completed”, do wallet transfers
      if (status === 'Completed') {
        const priceInfo = await this.pricesService.findByCatIdAndSubCatId(
          document.category_id,
          document.subcategory_id,
        );
        if (!priceInfo) {
          throw new BadRequestException('Distributable amount not found.');
        }
        const amount = Number(priceInfo.distributable_amount);
        if (isNaN(amount) || amount <= 0) {
          throw new BadRequestException('Invalid distributable amount.');
        }

        const ADMIN_USER_ID = 5;
        // subtract from admin
        const adminDebited = await this.walletService.subtractWalletBalance(
          ADMIN_USER_ID,
          amount,          // ← only two args
        );
        if (!adminDebited) {
          throw new InternalServerErrorException('Failed to debit admin wallet.');
        }

        // add to distributor
        const distributorId = Number(document.distributor_id);
        const distCredited = await this.walletService.addWalletBalance(
          distributorId,
          amount,         // ← only two args
        );
        if (!distCredited) {
          throw new InternalServerErrorException('Failed to credit distributor wallet.');
        }
      }

      // 6) Final document updates
      document.status = status;
      document.status_updated_at = new Date();

      // 7) Persist
      const saved = await queryRunner.manager.save(Document, document);
      await queryRunner.commitTransaction();

      // 8) Post‐transaction emails
      if (status === 'Rejected') {
        await this.sendStatusRejectedEmail(saved, document.rejection_reason!);
      } else if (status === 'Uploaded') {
        await this.sendStatusUploadedEmail(saved);
      }
      // … handle Sent/Received as before …

      return {
        message: 'Status updated successfully',
        document: saved,
      };
    } catch (err) {
      await queryRunner.rollbackTransaction();
      if (err instanceof BadRequestException || err instanceof InternalServerErrorException) {
        throw err;
      }
      throw new InternalServerErrorException('Could not update document status');
    } finally {
      await queryRunner.release();
    }
  }
  async reuploadDocument(
    documentId: number, documentType: string, file: Express.Multer.File,
  ): Promise<Document> {
    // 1. Fetch
    const document = await this.documentRepository.findOne({
      where: { document_id: documentId },
    });
    if (!document) {
      throw new BadRequestException('Document not found.');
    }

    // 2. Find the slot in the JSON array
    const idx = document.documents.findIndex(
      (doc) => doc.document_type === documentType,
    );
    if (idx === -1) {
      throw new BadRequestException(`Document type "${documentType}" not found.`);
    }

    // 3. Upload new file
    const fileUrl = await this.s3Service.uploadFile(file);

    // 4. Update the slot’s file info
    document.documents[idx] = {
      ...document.documents[idx],
      file_path: fileUrl,
      mimetype: file.mimetype,
    };

    // 5. Reset status to Pending & update history
    document.status = 'Resubmit';
    document.status_updated_at = new Date();
    document.status_history = document.status_history || [];
    document.status_history.push({
      status: 'Resubmit',
      updated_at: document.status_updated_at,
    });

    // 6. Save
    const updated = await this.documentRepository.save(document);

    // 7. Send notification email for only the re-uploaded type
    await this.sendStatusPendingEmail(updated, documentType);

    return updated;
  }

  private async sendStatusPendingEmail(document: Document, documentType: string) {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'rutujadeshmukh175@gmail.com',
        pass: 'wrbc dwbq ittr lyqa',
      },
    });

    const mailOptions = {
      from: 'rutujadeshmukh175@gmail.com',
      to: document.email,
      subject: 'Application Status Updated to Pending',
      text: `Dear ${document.name},

Your document "${documentType}" has been re-uploaded successfully.
The status of your application (ID: ${document.application_id}) is now PENDING.

We will review it shortly and notify you once the review is complete.

Best regards,
Aaradhya Cyber`,
    };

    try {
      await transporter.sendMail(mailOptions);
      console.log('✅ Pending-status email sent for', documentType);
    } catch (err) {
      console.error('❌ Error sending pending-status email:', err);
    }
  }

  async uploadReceipt(documentId: number, receiptFile: Express.Multer.File) {
    try {
      console.log('🧾 Received Receipt File:', receiptFile);

      // ✅ Validate that a receipt file is uploaded
      if (!receiptFile) {
        throw new BadRequestException('A receipt file must be uploaded.');
      }

      // ✅ Find the document by its ID
      const document = await this.documentRepository.findOne({ where: { document_id: documentId } });
      if (!document) {
        throw new BadRequestException('Document not found.');
      }

      // ✅ Upload the receipt file to S3
      const receiptUrl = await this.s3Service.uploadFile(receiptFile);

      // ✅ Update the document record with the receipt URL
      document.receipt_url = receiptUrl;
      const updatedDocument = await this.documentRepository.save(document);

      console.log('✅ Receipt uploaded successfully:', updatedDocument);

      return { message: 'Receipt upload successful', document: updatedDocument };
    } catch (error) {
      console.error('❌ Error uploading receipt:', error);
      throw new InternalServerErrorException('Failed to upload receipt');
    }
  }
  async updateReceipt(documentId: number, receiptFile: Express.Multer.File) {
    if (!receiptFile) {
      throw new BadRequestException('A receipt file must be uploaded.');
    }

    const document = await this.documentRepository.findOne({
      where: { document_id: documentId },
    });
    if (!document) {
      throw new NotFoundException('Document not found.');
    }

    try {
      // 🔄 (optional) delete old file from S3 if present
      if (document.receipt_url) {
        await this.s3Service.deleteFileByUrl(document.receipt_url);
      }

      // ✅ upload the new file
      const newReceiptUrl = await this.s3Service.uploadFile(receiptFile);

      // ✅ update and save
      document.receipt_url = newReceiptUrl;
      const updated = await this.documentRepository.save(document);

      console.log('✅ Receipt updated successfully:', updated);
      return {
        message: 'Receipt updated successfully',
        document: updated,
      };
    } catch (error) {
      console.error('❌ Error updating receipt:', error);
      throw new InternalServerErrorException('Failed to update receipt');
    }
  }

  // Send email when document status is "Approved"
  async sendStatusApprovedEmail(document: any) {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'rutujadeshmukh175@gmail.com', // Your email address
        pass: 'wrbc dwbq ittr lyqa', // Your email password or app password
      },
    });

    const mailOptions = {
      from: 'rutujadeshmukh175@gmail.com',
      to: document.email,
      subject: 'Application Status: Approved',
      text: `Dear ${document.name},

Congratulations! Your application for the category "${document.category_name}" has been approved.

We will get back to you soon with the next steps.

Best regards,
Aaradhya Cyber`,
    };

    try {
      await transporter.sendMail(mailOptions);
      console.log('✅ Email sent successfully');
    } catch (error) {
      console.error('❌ Error sending email:', error);
    }
  }


  async sendStatusRejectedEmail(document: any, rejectionReason: string) {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'rutujadeshmukh175@gmail.com', // Your email address
        pass: 'wrbc dwbq ittr lyqa', // Your email password or app password
      },
    });

    const mailOptions = {
      from: 'rutujadeshmukh175@gmail.com',
      to: document.email,
      subject: 'Application Status: Rejected',
      text: `Dear ${document.name},

We regret to inform you that your application for the category "${document.category_name}" has been rejected.

Reason for rejection:
${rejectionReason}

Please contact us for the next steps.

Best regards,
Aaradhya Cyber`,
    };

    try {
      await transporter.sendMail(mailOptions);
      console.log('✅ Email sent successfully');
    } catch (error) {
      console.error('❌ Error sending email:', error);
    }
  }

  // Send email when document status is "Completed"
  async sendStatusCompletedEmail(document: any) {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'rutujadeshmukh175@gmail.com', // Your email address
        pass: 'wrbc dwbq ittr lyqa', // Your email password or app password
      },
    });

    const mailOptions = {
      from: 'rutujadeshmukh175@gmail.com',
      to: document.email,
      subject: 'Application Status: Completed',
      text: `Dear ${document.name},

Your application for the category "${document.category_name}" has been completed.

You can now download your certificate from your portal.

Best regards,
Aaradhya Cyber`,
    };

    try {
      await transporter.sendMail(mailOptions);
      console.log('✅ Email sent successfully');
    } catch (error) {
      console.error('❌ Error sending email:', error);
    }
  }

  // Send email when document status is "Uploaded"
  async sendStatusUploadedEmail(document: any) {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'rutujadeshmukh175@gmail.com', // Your email address
        pass: 'wrbc dwbq ittr lyqa', // Your email password or app password
      },
    });

    const mailOptions = {
      from: 'rutujadeshmukh175@gmail.com',
      to: document.email,
      subject: 'Application Status: Uploaded',
      text: `Dear ${document.name},

Your certificate has been sent to your portal. Please check and update it accordingly.

Best regards,
Aaradhya Cyber`,
    };

    try {
      await transporter.sendMail(mailOptions);
      console.log('✅ Email sent successfully');
    } catch (error) {
      console.error('❌ Error sending email:', error);
    }
  }



  // async uploadDocuments(files: Express.Multer.File[], body: any) {
  //   try {
  //     console.log('📂 Received Files:', files);
  //     console.log('📝 Received Body:', body);

  //     // ✅ Validate that at least one file is uploaded
  //     if (!files || files.length === 0) {
  //       throw new BadRequestException('At least one file must be uploaded.');
  //     }

  //     // ✅ Upload files to S3 and store their details
  //     const documentFiles = await Promise.all(
  //       files.map(async (file) => {
  //         const fileUrl = await this.s3Service.uploadFile(file);
  //         return {
  //           document_type: file.mimetype,
  //           file_path: fileUrl,
  //         };
  //       })
  //     );

  //     // ✅ Parse document_fields safely
  //     let documentFields = {};
  //     if (body.document_fields) {
  //       try {
  //         documentFields = JSON.parse(body.document_fields);
  //       } catch (error) {
  //         console.error('❌ JSON Parse Error:', error);
  //         throw new BadRequestException('Invalid JSON format for document_fields.');
  //       }
  //     }

  //     // ✅ Ensure user_id is properly parsed
  //     const userId = parseInt(body.user_id, 10);
  //     if (isNaN(userId)) {
  //       throw new BadRequestException('Invalid user_id. It must be a number.');
  //     }

  //     // ✅ Check for distributor_id (allow null)
  //     const distributorId = body.distributor_id || null;

  //     // ✅ Create the document entry
  //     const document = this.documentRepository.create({
  //       user_id: userId,
  //       category_name: body.category_name || '',
  //       subcategory_name: body.subcategory_name || '',
  //       name: body.name || '',
  //       email: body.email || '',
  //       phone: body.phone || '',
  //       address: body.address || '',
  //       documents: documentFiles,
  //       status: 'Pending', // Default status
  //       distributor_id: distributorId,
  //       document_fields: documentFields, // ✅ Store new document fields
  //     });

  //     // ✅ Save document to the database
  //     const savedDocument = await this.documentRepository.save(document);
  //     console.log('✅ Document saved successfully:', savedDocument);

  //     // ✅ Send email notification after successful upload
  //     await this.sendDocumentSubmissionEmail(savedDocument);

  //     return { message: 'Upload successful', document: savedDocument };
  //   } catch (error) {
  //     console.error('❌ Error saving document:', error);
  //     throw new InternalServerErrorException('Failed to process document upload');
  //   }
  // }

  // Generate a smart prefix from the entire subcategory name
  private getSubcategoryPrefix(subcategoryName: string): string {
    return subcategoryName
      .toUpperCase()                         // Make it uppercase
      .replace(/CERTIFICATE/g, 'CERT')      // Optional shortening
      .replace(/YEAR/g, 'Y')                // Replace 'Year' with 'Y'
      .replace(/[^A-Z0-9]/g, '')            // Remove spaces and special characters
      .substring(0, 10);                    // Limit length to avoid long prefixes
  }

  private async generateApplicationId(subcategoryName: string): Promise<string> {
    const prefix = this.getSubcategoryPrefix(subcategoryName);  // Ex: INCOMECERT3Y

    const latestDocument = await this.documentRepository
      .createQueryBuilder('document')
      .where('document.application_id LIKE :prefix', { prefix: `${prefix}%` })
      .orderBy('document.application_id', 'DESC')
      .getOne();

    let nextNumber = 1;

    if (latestDocument?.application_id) {
      const match = latestDocument.application_id.match(/\d+$/);
      if (match) {
        nextNumber = parseInt(match[0], 10) + 1;
      }
    }

    return `${prefix}${nextNumber.toString().padStart(2, '0')}`;
  }

  async uploadDocuments(files: Express.Multer.File[], body: any) {
    try {
      console.log('📂 Received Files:', files);
      console.log('📝 Received Body:', body);

      // ✅ Validate that at least one file is uploaded
      if (!files || files.length === 0) {
        throw new BadRequestException('At least one file must be uploaded.');
      }

      // ✅ Upload files to S3 and store their details
      const documentFiles = await Promise.all(
        files.map(async (file, index) => {
          const fileUrl = await this.s3Service.uploadFile(file);

          // Use the document_types array from the body to set the document_type
          const customDocType = body.document_types ? body.document_types[index] : null;

          return {
            document_type: customDocType || file.originalname.split('.')[0], // Use custom name if provided
            mimetype: file.mimetype, // ✅ Store MIME type for safety
            file_path: fileUrl,
          };
        })
      );

      // ✅ Parse document_fields safely
      let documentFields = {};
      if (body.document_fields) {
        try {
          documentFields = JSON.parse(body.document_fields);
        } catch (error) {
          console.error('❌ JSON Parse Error:', error);
          throw new BadRequestException('Invalid JSON format for document_fields.');
        }
      }

      // ✅ Ensure user_id is properly parsed
      const userId = parseInt(body.user_id, 10);
      if (isNaN(userId)) {
        throw new BadRequestException('Invalid user_id. It must be a number.');
      }

      // ✅ Ensure category_id and subcategory_id are properly parsed
      const categoryId = parseInt(body.category_id, 10);
      if (isNaN(categoryId)) {
        throw new BadRequestException('Invalid category_id. It must be a number.');
      }

      const subcategoryId = parseInt(body.subcategory_id, 10);
      if (isNaN(subcategoryId)) {
        throw new BadRequestException('Invalid subcategory_id. It must be a number.');
      }

      // ✅ Check for distributor_id (allow null)
      const distributorId = body.distributor_id || null;
      const selectedDocumentNames = body.selected_document_names || null; // Extract selected_document_names from the body

      // ✅ Check for rejection_reason (allow null)
      const rejectionReason = body.rejection_reason || null; // Extract rejection_reason from the body
      // ✅ Check for remark (allow null)
      const remark = body.remark || null; // Extract the remark from the body

      // ✅ Generate a unique application_id based on subcategory
      const subcategoryName = body.subcategory_name || '';
      const applicationId = await this.generateApplicationId(subcategoryName);

      // ✅ Create the document entry
      const document = this.documentRepository.create({
        user_id: userId,
        category_id: categoryId,
        category_name: body.category_name || '',
        subcategory_id: subcategoryId,
        subcategory_name: subcategoryName,
        name: body.name || '',
        email: body.email || '',
        phone: body.phone || '',
        address: body.address || '',
        documents: documentFiles,
        status: 'Pending', // Default status
        distributor_id: distributorId,
        document_fields: documentFields, // ✅ Store new document fields
        application_id: applicationId, // ✅ Store generated application ID
        remark: remark, // ✅ Add the remark field
        selected_document_names: selectedDocumentNames, // ✅ Add selected_document_names field
        rejection_reason: rejectionReason, // ✅ Add rejection_reason field
      });

      // ✅ Save document to the database
      const savedDocument = await this.documentRepository.save(document);
      console.log('✅ Document saved successfully:', savedDocument);

      // ✅ Send email notification after successful upload
      await this.sendDocumentSubmissionEmail(savedDocument);

      return { message: 'Upload successful', document: savedDocument };
    } catch (error) {
      console.error('❌ Error saving document:', error);
      throw new InternalServerErrorException('Failed to process document upload');
    }
  }
  // Helper function to send email
  async sendDocumentSubmissionEmail(document: any) {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'rutujadeshmukh175@gmail.com', // Your email address
        pass: 'wrbc dwbq ittr lyqa', // Your email password or app password
      },
    });

    const mailOptions = {
      from: 'rutujadeshmukh175@gmail.com',
      to: document.email, // Recipient email from the document
      subject: 'Application Submitted Successfully',
      text: `Dear ${document.name},

Thank you for applying! Your application for the category "${document.category_name}" has been submitted successfully.

Your Application ID: ${document.application_id}

We will review your application and get back to you shortly.

Best regards,
Aaradhya Cyber`,
    };

    try {
      await transporter.sendMail(mailOptions);
      console.log('✅ Email sent successfully');
    } catch (error) {
      console.error('❌ Error sending email:', error);
    }
  }




  async assignDistributor(documentId: number, distributorId: string, remark?: string | null) {
    if (!documentId || !distributorId) {
      throw new BadRequestException('Document ID and Distributor ID are required.');
    }

    const queryRunner = this.documentRepository.manager.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      console.log('🔍 Assigning distributor:', distributorId);

      const document = await queryRunner.manager.findOne(Document, {
        where: { document_id: documentId },
      });

      if (!document) {
        throw new BadRequestException('Document not found.');
      }

      document.distributor_id = distributorId;

      if (remark) {  // Only update if remark is provided
        document.remark = remark;
      }

      const updatedDocument = await queryRunner.manager.save(Document, document);

      await queryRunner.commitTransaction();

      console.log('✅ Distributor assigned successfully:', updatedDocument);
      return { message: 'Distributor assigned successfully', document: updatedDocument };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      console.error('❌ Error assigning distributor:', error);
      throw new InternalServerErrorException('Could not assign distributor. Please try again later.');
    } finally {
      await queryRunner.release();
    }
  }


  async getAllDocumentsByDistributor(distributorId: string) {
    try {
      console.log('🔍 Fetching documents for distributor:', distributorId);

      const documents = await this.documentRepository.find({ where: { distributor_id: distributorId } });

      console.log('📄 Documents fetched:', documents);

      return {
        message: 'Documents fetched successfully for distributor',
        documents,
      };
    } catch (error) {
      console.error('❌ Error fetching documents for distributor:', error);
      throw new InternalServerErrorException('Could not fetch documents');
    }
  }

  async getRecentApplications(): Promise<Document[]> {
    return await this.documentRepository
      .createQueryBuilder('document')
      .orderBy('document.uploaded_at', 'DESC') // Sort by uploaded_at in descending order
      .limit(10) // Limit the results to 10
      .getMany();
  }



  // ✅ Update document fields dynamically
  async updateDocumentFields(documentId: number, updatedFields: Record<string, any>) {
    try {
      console.log('🔄 Updating document fields for:', documentId);

      const document = await this.documentRepository.findOne({ where: { document_id: documentId } });

      if (!document) {
        throw new BadRequestException('Document not found.');
      }

      document.document_fields = { ...document.document_fields, ...updatedFields }; // ✅ Merge fields
      const updatedDocument = await this.documentRepository.save(document);

      console.log('✅ Document fields updated successfully:', updatedDocument);
      return { message: 'Document fields updated successfully', document: updatedDocument };
    } catch (error) {
      console.error('❌ Error updating document fields:', error);
      throw new InternalServerErrorException('Could not update document fields');
    }
  }




  async findByCategoryAndSubcategory(categoryId: number, subcategoryId: number) {
    try {
      const documents = await this.documentRepository.find({
        where: {
          category_id: categoryId,
          subcategory_id: subcategoryId,
        },
      });

      return documents.length ? documents : [];
    } catch (error) {
      console.error('❌ Error fetching documents:', error);
      return [];
    }
  }


  async findByCategorySubcategoryAndDistributor(categoryId: number, subcategoryId: number, distributorId?: string) {
    try {
      const whereCondition: any = {
        category_id: categoryId,
        subcategory_id: subcategoryId,
      };

      if (distributorId && distributorId !== 'null') {
        whereCondition.distributor_id = distributorId;
      }

      const documents = await this.documentRepository.find({ where: whereCondition });

      return documents.length ? documents : { message: 'No documents found', documents: [] };
    } catch (error) {
      console.error('❌ Error fetching documents:', error);
      return { message: 'Failed to fetch documents', error: error.message };
    }
  }




  async findByCategorySubcategoryAndUser(categoryId: number, subcategoryId: number, userId: number) {
    try {
      let documents = await this.documentRepository.find({
        where: {
          category_id: categoryId,
          subcategory_id: subcategoryId,
          user_id: userId,
        },
      });

      return documents.length ? documents : [];
    } catch (error) {
      console.error('❌ Error fetching documents:', error);
      return [];
    }
  }




  async findByCategoryAndSubcategoryUserId(
    categoryId: number,
    subcategoryId: number,
    userId: number
  ) {
    try {
      // Skip user validation and just fetch documents
      const documents = await this.documentRepository.find({
        where: {
          category_id: categoryId,
          subcategory_id: subcategoryId,
        },
      });

      return documents.length ? documents : [];
    } catch (error) {
      console.error('❌ Error fetching documents:', error);
      return [];
    }
  }



}



