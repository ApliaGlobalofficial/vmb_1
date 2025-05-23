import { Injectable, BadRequestException, NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RequestError } from './entities/request-error.entity';
import { S3Service } from './s3.service';
import { Express } from 'express';
import * as nodemailer from 'nodemailer';

@Injectable()
export class RequestErrorsService {
  constructor(
    @InjectRepository(RequestError)
    private readonly requestErrorRepository: Repository<RequestError>,
    private readonly s3Service: S3Service
  ) { }

  // ✅ Create an error request with file upload
  // async createRequest(file: Express.Multer.File, body: any) {
  //   try {
  //     if (!file) throw new BadRequestException('Error document is required.');

  //     const fileUrl = await this.s3Service.uploadFile(file);

  //     const request = this.requestErrorRepository.create({
  //       request_description: body.request_description,
  //       error_document: fileUrl,
  //       document_id: Number(body.document_id),
  //       category_id: Number(body.category_id),
  //       subcategory_id: Number(body.subcategory_id),
  //       user_id: Number(body.user_id),
  //       distributor_id: body.distributor_id,
  //       application_id:body.application_id,
  //       request_status: 'Pending',
  //     });

  //     return await this.requestErrorRepository.save(request);
  //   } catch (error) {
  //     throw new InternalServerErrorException('Failed to create error request.');
  //   }
  // }




  async createRequest(file: Express.Multer.File, body: any) {
    if (!file) {
      throw new BadRequestException('Error document is required.');
    }

    const fileUrl = await this.s3Service.uploadFile(file);

    const reqEntity = this.requestErrorRepository.create({
      request_description: body.request_description,
      error_document: fileUrl,
      document_id: Number(body.document_id),
      category_id: Number(body.category_id),
      subcategory_id: Number(body.subcategory_id),
      user_id: Number(body.user_id),
      distributor_id: body.distributor_id,
      application_id: body.application_id,
      request_status: 'Pending',
      request_name: body.request_name,
      request_email: body.request_email,
      error_type: body.error_type,    // ← new!
    });

    try {
      const saved = await this.requestErrorRepository.save(reqEntity);
      await this.sendRequestCreatedEmail(saved);
      return saved;
    } catch (err: any) {
      if (err.code === 'ER_DUP_ENTRY' && err.message.includes('application_id')) {
        const existing = await this.requestErrorRepository.findOne({
          where: { application_id: body.application_id }
        });
        if (!existing) {
          throw new InternalServerErrorException('Failed to locate existing error request.');
        }

        // overwrite the old record
        existing.request_description = body.request_description;
        existing.error_document = fileUrl;
        existing.document_id = Number(body.document_id);
        existing.category_id = Number(body.category_id);
        existing.subcategory_id = Number(body.subcategory_id);
        existing.user_id = Number(body.user_id);
        existing.distributor_id = body.distributor_id;
        existing.request_name = body.request_name;
        existing.request_email = body.request_email;
        existing.request_status = 'Pending';
        existing.error_type = body.error_type;

        const updated = await this.requestErrorRepository.save(existing);
        return updated;
      }

      throw new InternalServerErrorException('Failed to create or update error request.');
    }
  }


  // ✅ Get all error requests
  async getAllRequests() {
    return await this.requestErrorRepository.find();
  }

  // ✅ Get request by ID
  async getRequestById(requestId: number) {
    const request = await this.requestErrorRepository.findOne({ where: { request_id: requestId } });
    if (!request) throw new NotFoundException(`Request with ID ${requestId} not found.`);
    return request;
  }

  // ✅ Get requests by Distributor ID
  async getRequestsByDistributorId(distributorId: string) {
    return await this.requestErrorRepository.find({ where: { distributor_id: distributorId } });
  }

  // async updateRequestStatus(requestId: number, request_status: string) {
  //   const request = await this.requestErrorRepository.findOne({ where: { request_id: requestId } });

  //   if (!request) {
  //     throw new NotFoundException(`Request with ID ${requestId} not found`);
  //   }

  //   request.request_status = request_status; // ✅ Update status properly
  //   return await this.requestErrorRepository.save(request);
  // }





  // ✅ Delete a request
  async deleteRequest(requestId: number) {
    const request = await this.getRequestById(requestId);
    await this.requestErrorRepository.remove(request);
    return { message: 'Request deleted successfully' };
  }


  async sendRequestCreatedEmail(request: RequestError) {
    const transporter = this.createTransporter();

    const mailOptions = {
      from: 'rutujadeshmukh175@gmail.com',
      to: request.request_email,
      subject: 'Error Request Submitted Successfully',
      text: `Dear ${request.request_name},

Your error request for the "${request.request_description}" has been submitted successfully.

We will review your request and get back to you shortly.

Application ID: ${request.application_id}

Status: Pending

Best regards,
Aaradhya Cyber`,
    };

    await this.sendEmail(transporter, mailOptions);
  }



  async updateRequestStatus(requestId: number, request_status: string, rejectionReason?: string) {
    try {
      console.log(`🔹 Updating request ${requestId} with status: ${request_status}, Reason: ${rejectionReason}`);

      const request = await this.requestErrorRepository.findOne({ where: { request_id: requestId } });

      if (!request) {
        console.error(`❌ Request with ID ${requestId} not found`);
        throw new NotFoundException(`Request with ID ${requestId} not found`);
      }

      // ✅ Ensure rejectionReason is provided when status is "Rejected" or "Distributor Rejected"
      if ((request_status === 'Rejected' || request_status === 'Distributor Rejected') && !rejectionReason) {
        console.error(`❌ Rejection reason is required for status ${request_status}`);
        throw new BadRequestException('Rejection reason is required for rejected status.');
      }

      // ✅ Update request status and set rejectionReason
      request.request_status = request_status;

      // 🔹 Explicitly add rejectionReason field (if applicable)
      if (rejectionReason) {
        (request as any).rejection_reason = rejectionReason; // Ensure this field exists in your database
      }

      // ✅ Save updated request
      const updatedRequest = await this.requestErrorRepository.save(request);

      console.log("✅ Request updated successfully:", updatedRequest);

      // ✅ Send email notification (pass `rejectionReason` correctly)
      await this.sendStatusUpdateEmail(updatedRequest, rejectionReason);

      return { message: 'Request status updated successfully', request: updatedRequest };
    } catch (error) {
      console.error("❌ Error in updateRequestStatus:", error);
      throw new InternalServerErrorException('Failed to update request status');
    }
  }


  // ✅ Send email when request is created

  // ✅ Send email when request status is updated
  async sendStatusUpdateEmail(request: RequestError, rejectionReason?: string) {
    const transporter = this.createTransporter();
    let subject = '';
    let text = '';

    switch (request.request_status) {
      case 'Approved':
        subject = 'Error Request Approved';
        text = `Dear ${request.request_name},

Your error request has been approved for "${request.request_description}". We will proceed with the necessary actions.

Application ID: ${request.application_id}

Best regards,
Aaradhya Cyber`;
        break;

      case 'Rejected':
        if (!rejectionReason) {
          throw new InternalServerErrorException('Rejection reason is required for rejected status.');
        }
        subject = 'Error Request Rejected';
        text = `Dear ${request.request_name},

We regret to inform you that your error request for "${request.request_description}" has been rejected.

Reason: ${rejectionReason}

Application ID: ${request.application_id}

Best regards,
Aaradhya Cyber`;
        break;

      case 'Completed':
        subject = 'Error Request Completed';
        text = `Dear ${request.request_name},

Your error request has been successfully completed for "${request.request_description}".
The requested document has been updated. Please check your portal for more details.

Application ID: ${request.application_id}

Best regards,
Aaradhya Cyber`;
        break;

      case 'Uploaded':
        subject = 'Error Request Document Uploaded';
        text = `Dear ${request.request_name},

The requested document has been uploaded for "${request.request_description}".

Application ID: ${request.application_id}

Best regards,
Aaradhya Cyber`;
        break;

      case 'Distributor Rejected':
        if (!rejectionReason) {
          throw new InternalServerErrorException('Rejection reason is required for distributor rejected status.');
        }
        subject = 'Error Request Rejected by Distributor';
        text = `Dear ${request.request_name},
      
      We regret to inform you that your error request for "${request.request_description}" has been rejected by the Distributor.
      
      Reason: ${rejectionReason}
      
      Application ID: ${request.application_id}
      
      Best regards,  
      Aaradhya Cyber`;
        break;

      default:
        return;
    }

    const mailOptions = {
      from: 'rutujadeshmukh175@gmail.com',
      to: request.request_email,
      subject,
      text,
    };

    await this.sendEmail(transporter, mailOptions);
  }

  // ✅ Helper function to create transporter
  private createTransporter() {
    return nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'rutujadeshmukh175@gmail.com', // Your email address
        pass: 'wrbc dwbq ittr lyqa', // Your email password or app password
      },
    });
  }

  // ✅ Helper function to send email
  private async sendEmail(transporter: nodemailer.Transporter, mailOptions: nodemailer.SendMailOptions) {
    try {
      await transporter.sendMail(mailOptions);
      console.log('✅ Email sent successfully');
    } catch (error) {
      console.error('❌ Error sending email:', error);
    }
  }

}
