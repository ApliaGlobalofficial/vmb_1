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
            endpoint: process.env.AWS_S3_ENDPOINT, // ✅ Ensure endpoint is set
            signatureVersion: 'v4', // ✅ Ensures proper signing
            s3ForcePathStyle: true, // ✅ Fixes incorrect bucket URL formats
        });
    }

    /**
     * Uploads a file to S3 for the PrivacyPolicy entity.
     * @param file - The file to upload.
     * @returns The S3 URL of the uploaded file.
     */
    async uploadFile(file: Express.Multer.File): Promise<string> {
        const params = {
            Bucket: this.bucketName,
            Key: `privacy-policy/${Date.now()}-${file.originalname}`, // ✅ Store in a dedicated folder
            Body: file.buffer,
            ContentType: file.mimetype,
            ContentDisposition: `inline; filename="${file.originalname}"`, // ✅ Ensure proper file handling
        };

        try {
            console.log(`📤 Uploading to S3: Bucket=${this.bucketName}, Key=${params.Key}`);

            const uploadResult = await this.s3.upload(params).promise();
            console.log(`✅ Upload Successful: ${uploadResult.Location}`);

            return uploadResult.Location; // ✅ Return S3 URL
        } catch (error) {
            console.error('❌ S3 Upload Error:', error);
            throw new InternalServerErrorException('S3 upload failed');
        }
    }

    /**
     * Deletes a file from S3.
     * @param fileUrl - The S3 URL of the file to delete.
     */
    async deleteFile(fileUrl: string): Promise<void> {
        const fileKey = fileUrl.split('.amazonaws.com/')[1]; // ✅ Extract the file key from the URL

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

    /**
     * Updates a file in S3 by deleting the old file and uploading a new one.
     * @param oldFileUrl - The S3 URL of the old file to delete.
     * @param newFile - The new file to upload.
     * @returns The S3 URL of the new file.
     */
    async updateFile(oldFileUrl: string, newFile: Express.Multer.File): Promise<string> {
        try {
            // Delete the old file
            if (oldFileUrl) {
                await this.deleteFile(oldFileUrl);
            }

            // Upload the new file
            const newFileUrl = await this.uploadFile(newFile);
            return newFileUrl;
        } catch (error) {
            console.error('❌ S3 Update Error:', error);
            throw new InternalServerErrorException('S3 update failed');
        }
    }
}