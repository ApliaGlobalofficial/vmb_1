import { Injectable, InternalServerErrorException } from '@nestjs/common';
import * as AWS from 'aws-sdk';
import * as dotenv from 'dotenv';

dotenv.config();

@Injectable()
export class S3Service {
  private s3: AWS.S3;
  private bucketName: string;

  constructor() {
    if (!process.env.AWS_S3_BUCKET_NAME) {
      throw new Error('Missing AWS_S3_BUCKET_NAME in environment variables');
    }

    this.bucketName = process.env.AWS_S3_BUCKET_NAME;

    this.s3 = new AWS.S3({
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      region: process.env.AWS_REGION,
      endpoint: process.env.AWS_S3_ENDPOINT,
      signatureVersion: 'v4',
      s3ForcePathStyle: true,
    });
  }

  async uploadFile(file: Express.Multer.File): Promise<string> {
    const params: AWS.S3.PutObjectRequest = {
      Bucket: this.bucketName,
      Key: `uploads/${Date.now()}-${file.originalname}`,
      Body: file.buffer,
      ContentType: file.mimetype,
      ContentDisposition: `inline; filename="${file.originalname}"`,
    };

    try {
      console.log(`📤 Uploading to S3: Bucket=${this.bucketName}, Key=${params.Key}`);
      const uploadResult = await this.s3.upload(params).promise();
      console.log(`✅ Upload Successful: ${uploadResult.Location}`);
      return uploadResult.Location;
    } catch (error) {
      console.error('❌ S3 Upload Error:', error);
      throw new InternalServerErrorException('S3 upload failed');
    }
  }

  /**
   * Delete an object from S3 by its full URL
   */
  async deleteFileByUrl(fileUrl: string): Promise<void> {
    try {
      const url = new URL(fileUrl);
      let key = url.pathname;

      // If the bucket is part of the path (path-style), strip it out.
      const bucketPrefix = `/${this.bucketName}/`;
      if (key.startsWith(bucketPrefix)) {
        key = key.slice(bucketPrefix.length);
      } else if (key.startsWith('/')) {
        key = key.slice(1);
      }

      console.log(`🗑 Deleting from S3: Bucket=${this.bucketName}, Key=${key}`);
      await this.s3
        .deleteObject({ Bucket: this.bucketName, Key: key })
        .promise();

      console.log('✅ Delete Successful');
    } catch (error) {
      console.error('❌ S3 Delete Error:', error);
      throw new InternalServerErrorException('S3 delete failed');
    }
  }
}
