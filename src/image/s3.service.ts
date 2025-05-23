import { Injectable, InternalServerErrorException } from '@nestjs/common';
import * as AWS from 'aws-sdk';
import * as dotenv from 'dotenv';
import { Express } from 'express';

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

    async uploadFile(file: Express.Multer.File, folder: string = 'general'): Promise<string> {
        const params = {
            Bucket: this.bucketName,
            Key: `${folder}/${Date.now()}-${file.originalname}`,
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

    async uploadYouTubeFile(file: Express.Multer.File): Promise<string> {
        return this.uploadFile(file, 'youtube');
    }

    async deleteFile(fileUrl: string): Promise<void> {
        const fileKey = fileUrl.split('.amazonaws.com/')[1];

        const params = {
            Bucket: this.bucketName,
            Key: fileKey,
        };

        try {
            console.log(`🗑️ Deleting from S3: Bucket=${this.bucketName}, Key=${fileKey}`);
            await this.s3.deleteObject(params).promise();
            console.log(`✅ Deletion Successful: ${fileKey}`);
        } catch (error) {
            console.error('❌ S3 Delete Error:', error);
            throw new InternalServerErrorException('S3 deletion failed');
        }
    }

    async updateFile(oldFileUrl: string, newFile: Express.Multer.File, folder: string = 'general'): Promise<string> {
        try {
            if (oldFileUrl) {
                await this.deleteFile(oldFileUrl);
            }
            return this.uploadFile(newFile, folder);
        } catch (error) {
            console.error('❌ S3 Update Error:', error);
            throw new InternalServerErrorException('S3 update failed');
        }
    }

    async updateYouTubeFile(oldFileUrl: string, newFile: Express.Multer.File): Promise<string> {
        return this.updateFile(oldFileUrl, newFile, 'youtube');
    }
}