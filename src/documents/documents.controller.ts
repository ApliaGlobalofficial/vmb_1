import {
  Controller,
  Post,
  Get,
  Put,
  Param,
  Req,
  Body,
  UseInterceptors,
  UploadedFiles,
  ParseIntPipe,
  UploadedFile,
  NotFoundException,
  UseGuards,
  Query,
} from '@nestjs/common';
import { DocumentsService } from './documents.service';
import { Request } from 'express';
import { JwtAuthGuard } from '../jwt-auth/jwt-auth.guard';
import { BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { Document } from './entities/documents.entity';

@Controller('documents')
@UseGuards(JwtAuthGuard)
export class DocumentsController {
  constructor(private readonly documentsService: DocumentsService) { }

  @Post('upload')
  @UseInterceptors(
    FilesInterceptor('files', 10, {
      limits: { fileSize: 500 * 1024 }, // 200KB max file size
    }),
  )
  async uploadDocuments(
    @UploadedFiles() files: Express.Multer.File[],
    @Body() body: any,
  ) {
    try {
      console.log('📂 Received Files:', files);
      console.log('📝 Received Body:', body);

      if (!files || files.length === 0) {
        throw new BadRequestException('At least one file must be uploaded.');
      }

      return this.documentsService.uploadDocuments(files, body);
    } catch (error) {
      console.error('❌ Controller Error:', error);
      throw new InternalServerErrorException('File upload failed');
    }
  }

  @Get('history/:document_id')
  async getStatusHistory(@Param('document_id') documentId: number) {
    // Fetch the document with status history
    const document = await this.documentsService.getDocumentById(documentId);

    if (!document) {
      throw new NotFoundException('Document not found.');
    }

    // Return the status history
    return {
      message: 'Status history fetched successfully',
      status_history: document.status_history,
    };
  }

  // Endpoint to get the most recent 10 applications
  @Get('recent')
  async getRecentApplications(): Promise<Document[]> {
    return this.documentsService.getRecentApplications();
  }


  // 📌 GET API to fetch all documents
  @Get('list')
  async getAllDocuments() {
    try {
      return this.documentsService.getAllDocuments();
    } catch (error) {
      console.error('❌ Error fetching documents:', error);
      throw new InternalServerErrorException('Failed to fetch documents');
    }
  }


  // ✅ dynamic parameter — now GET /documents/receipt/A06 will work
  @Get('receipt/:applicationId')
  async getReceiptByApplicationId(
    @Param('applicationId') applicationId: string,
  ) {
    try {
      return await this.documentsService.getReceiptByApplicationId(
        applicationId,
      );
    } catch (err) {
      if (err instanceof NotFoundException) throw err;
      console.error('❌ Error in controller:', err);
      throw new InternalServerErrorException(
        'Failed to fetch receipt by application_id',
      );
    }
  }

  @Get('list_nodistributor')
  async getAllDocumentsNoDistributor() {
    try {
      return this.documentsService.getAllDocumentsNoDistributor(); // Call the correct method
    } catch (error) {
      console.error('❌ Error fetching documents:', error);
      throw new InternalServerErrorException('Failed to fetch documents');
    }
  }

  @Get('assigned-list')
  async getAssignedDocuments() {
    try {
      return this.documentsService.getAssignedDocuments();
    } catch (error) {
      console.error('❌ Error fetching assigned documents:', error);
      throw new InternalServerErrorException('Failed to fetch assigned documents');
    }
  }


  // 📌 PUT API to update document status
  // @Put('update-status/:id')
  // async updateDocumentStatus(
  //   @Param('id') documentId: number,
  //   @Body('status') status: string,
  // ) {
  //   try {
  //     if (!status) {
  //       throw new BadRequestException('Status is required.');
  //     }

  //     return this.documentsService.updateDocumentStatus(documentId, status);
  //   } catch (error) {
  //     console.error('❌ Error updating status:', error);
  //     throw new InternalServerErrorException('Failed to update document status');
  //   }
  // }



  @Put('update-status/:id')
  async updateDocumentStatus(@Req() req: Request,
    @Param('id') documentId: number,
    @Body('status') status: string,
    @Body('rejectionReason') rejectionReason?: string,
    @Body('selectedDocumentNames') selectedDocumentNames?: string[],
  ) {
    try {
      // Log the start of the process
      console.log('🔍request user is ID:', req.user);
      const document = await this.documentsService.getDocumentById(documentId);
      console.log('📄 Document Details:', document);

      // Validate required fields
      if (!status) {
        throw new BadRequestException('Status is required.');
      }

      // Log the incoming request data for debugging
      console.log('📝 Update Status Request:', {
        documentId,
        status,
        rejectionReason,
        selectedDocumentNames, 
      });

      const user = (req.user as any).userId;
      console.log('👤 User Info:', user);
      const userRole = (req.user as any).role;

      // Call the service method to update the document status
      const result = await this.documentsService.updateDocumentStatus(
        documentId,
        status,
        rejectionReason,
        selectedDocumentNames,
        userRole
      );

      // Log the successful update
      console.log('✅ Document status updated successfully:', result);

      return result;
    } catch (error) {
      // Log the error
      console.error('❌ Error updating status:', error.stack);

      // Handle specific errors
      if (error instanceof BadRequestException) {
        throw error; // Re-throw BadRequestException as is
      }

      // Throw a generic error for other cases
      throw new InternalServerErrorException('Failed to update document status');
    }
  }
  @Post('reupload/:documentId')
  @UseInterceptors(FileInterceptor('file'))
  async reuploadDocument(
    @Param('documentId') documentId: number,           // ← grab it as a string
    @Body('documentType') documentType: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    // Convert to boolean (only “true” → true)

    return this.documentsService.reuploadDocument(
      documentId,
      documentType,
      file,
    );
  }



  @Post('upload-receipt/:id')
  @UseInterceptors(FileInterceptor('receipt')) // Use multer to handle file uploads
  async uploadReceipt(
    @Param('id') documentId: number,
    @UploadedFile() receiptFile: Express.Multer.File,
  ) {
    try {
      if (!receiptFile) {
        throw new BadRequestException('A receipt file must be uploaded.');
      }

      return this.documentsService.uploadReceipt(documentId, receiptFile);
    } catch (error) {
      console.error('❌ Error uploading receipt:', error);
      throw new InternalServerErrorException('Failed to upload receipt');
    }
  }
  @Put('update-receipt/:id')
  @UseInterceptors(FileInterceptor('receipt'))
  async updateReceipt(
    @Param('id') documentId: number,
    @UploadedFile() receiptFile: Express.Multer.File,
  ) {
    if (!receiptFile) {
      throw new BadRequestException('A receipt file must be uploaded.');
    }
    try {
      return await this.documentsService.updateReceipt(
        documentId,
        receiptFile,
      );
    } catch (error) {
      console.error('❌ Error in controller updating receipt:', error);
      throw new InternalServerErrorException('Failed to update receipt');
    }
  }

  // 📌 PUT API to update document fields dynamically
  @Put('update-fields/:id')
  async updateDocumentFields(
    @Param('id') documentId: number,
    @Body() updatedFields: Record<string, any>,
  ) {
    try {
      console.log('🔄 Updating document fields for:', documentId);
      console.log('📑 New Fields:', updatedFields);

      if (!updatedFields || Object.keys(updatedFields).length === 0) {
        throw new BadRequestException('Updated fields cannot be empty.');
      }

      return this.documentsService.updateDocumentFields(documentId, updatedFields);
    } catch (error) {
      console.error('❌ Error updating document fields:', error);
      throw new InternalServerErrorException('Failed to update document fields');
    }
  }
  // 📌 PUT API to assign Distributor to a Document
  @Put('assign-distributor/:id')
  async assignDistributor(
    @Param('id') documentId: number,
    @Body() body: any, // Log the full body to debug
  ) {
    console.log("📩 Received request body:", body); // Debugging Log

    const distributorId = body.distributor_id;
    const remark = body.remark?.trim() || null; // Set remark to `null` if empty

    if (!distributorId) {
      throw new BadRequestException('Distributor user ID is required.');
    }

    // Remove remark validation (make it optional)
    return this.documentsService.assignDistributor(documentId, distributorId, remark);
  }




  // 📌 GET API to fetch documents by distributor_id
  @Get('list/:distributorId')
  async getDocumentsByDistributor(@Param('distributorId') distributorId: string) {
    try {
      if (!distributorId) {
        throw new BadRequestException('Distributor ID is required.');
      }

      return this.documentsService.getAllDocumentsByDistributor(distributorId);
    } catch (error) {
      console.error('❌ Error fetching distributor documents:', error);
      throw new InternalServerErrorException('Failed to fetch documents for distributor');
    }
  }



  @Get(':categoryId/:subcategoryId')
  async findByCategoryAndSubcategory(
    @Param('categoryId') categoryId: number,
    @Param('subcategoryId') subcategoryId: number
  ) {
    return this.documentsService.findByCategoryAndSubcategory(categoryId, subcategoryId);
  }


  @Get(':categoryId/:subcategoryId/:distributorId')
  async findDocuments(
    @Param('categoryId') categoryId: number,
    @Param('subcategoryId') subcategoryId: number,
    @Param('distributorId') distributorId: string,
  ) {
    return this.documentsService.findByCategorySubcategoryAndDistributor(categoryId, subcategoryId, distributorId);
  }



  @Get('doc/:categoryId/:subcategoryId/:userId')
  async findDocumentsByUser(
    @Param('categoryId') categoryId: number,
    @Param('subcategoryId') subcategoryId: number,
    @Param('userId') userId: number,
  ) {
    return this.documentsService.findByCategorySubcategoryAndUser(categoryId, subcategoryId, userId);
  }
  @Get('category-docs/:categoryId/:subcategoryId/:userId')
  async findByCategoryAndSubcategoryUserId(
    @Param('categoryId') categoryId: number,
    @Param('subcategoryId') subcategoryId: number,
    @Param('userId') userId: number,
  ) {
    return this.documentsService.findByCategoryAndSubcategoryUserId(
      categoryId,
      subcategoryId,
      userId
    );
  }







}
