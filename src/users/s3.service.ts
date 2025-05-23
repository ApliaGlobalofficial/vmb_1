import { Injectable, InternalServerErrorException } from '@nestjs/common';
import * as AWS from 'aws-sdk';
import { v4 as uuid } from 'uuid';

@Injectable()
export class S3Service {
  private s3: AWS.S3;
  private bucket: string;

  constructor() {
    if (!process.env.AWS_S3_BUCKET_NAME) {
      throw new InternalServerErrorException(
        'AWS S3 bucket name is not defined in environment variables'
      );
    }
    this.bucket = process.env.AWS_S3_BUCKET_NAME;

    this.s3 = new AWS.S3({
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      region: process.env.AWS_REGION,
    });
  }

  async uploadFile(file: Express.Multer.File): Promise<string> {
    const fileKey = `users/${uuid()}-${file.originalname}`;
    const params: AWS.S3.PutObjectRequest = {
      Bucket: this.bucket,
      Key: fileKey,
      Body: file.buffer,
      ContentType: file.mimetype,
    };

    try {
      await this.s3.upload(params).promise();
      return `https://${this.bucket}.s3.${process.env.AWS_REGION}.amazonaws.com/${fileKey}`;
    } catch (error) {
      throw new InternalServerErrorException(`File upload failed: ${error.message}`);
    }
  }

  /**
   * Deletes a file from S3. Accepts either the S3 key or the full public URL.
   */
  async deleteFile(keyOrUrl: string): Promise<void> {
    // if you passed the full URL, strip off the bucket hostname
    let Key = keyOrUrl;
    if (keyOrUrl.startsWith('http')) {
      const parts = keyOrUrl.split('.amazonaws.com/');
      if (parts.length !== 2) {
        throw new InternalServerErrorException(`Invalid S3 URL: ${keyOrUrl}`);
      }
      Key = parts[1];
    }

    try {
      await this.s3
        .deleteObject({ Bucket: this.bucket, Key })
        .promise();
    } catch (error) {
      throw new InternalServerErrorException(`File delete failed: ${error.message}`);
    }
  }
}
