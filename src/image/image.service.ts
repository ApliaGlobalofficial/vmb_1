// src/image/image.service.ts
import {
    Injectable,
    NotFoundException,
    BadRequestException,
    InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Not, IsNull } from 'typeorm';
import { Image } from './image.entity';
import { S3Service } from './s3.service';
import { Express } from 'express';

@Injectable()
export class ImageService {
    constructor(
        @InjectRepository(Image)
        private readonly imageRepository: Repository<Image>,
        private readonly s3Service: S3Service
    ) { }

    async createImage(
        file: Express.Multer.File,
        description?: string,
        youtubeLink?: string,
        youtubeDescription?: string
    ): Promise<Image> {
        if (!file) {
            throw new BadRequestException('Image file is required');
        }
        if (youtubeLink && !this.isValidYouTubeUrl(youtubeLink)) {
            throw new BadRequestException('Invalid YouTube URL format');
        }
        try {
            const folder = youtubeLink ? 'youtube' : 'general';
            const imageUrl = await this.s3Service.uploadFile(file, folder);
            const image = new Image();
            image.imageUrl = imageUrl;
            image.description = description ?? null;
            image.youtubeLink = youtubeLink ?? null;
            image.youtubeDescription = youtubeDescription ?? null;
            return await this.imageRepository.save(image);
        } catch (error) {
            console.error('Error creating image:', error);
            throw new InternalServerErrorException('Failed to create image');
        }
    }

    async getAllImages(): Promise<Image[]> {
        try {
            return await this.imageRepository.find({ order: { createdAt: 'DESC' } });
        } catch (error) {
            console.error('Error fetching images:', error);
            throw new InternalServerErrorException('Failed to fetch images');
        }
    }

    async getImageById(id: number): Promise<Image> {
        try {
            const image = await this.imageRepository.findOneBy({ id });
            if (!image) throw new NotFoundException(`Image ${id} not found`);
            return image;
        } catch (error) {
            if (error instanceof NotFoundException) throw error;
            console.error(`Error fetching image ${id}:`, error);
            throw new InternalServerErrorException('Failed to fetch image');
        }
    }

    async updateImage(
        id: number,
        file?: Express.Multer.File,
        description?: string,
        youtubeLink?: string,
        youtubeDescription?: string
    ): Promise<Image> {
        try {
            const image = await this.imageRepository.findOneBy({ id });
            if (!image) throw new NotFoundException(`Image ${id} not found`);
            if (youtubeLink && !this.isValidYouTubeUrl(youtubeLink)) {
                throw new BadRequestException('Invalid YouTube URL format');
            }
            if (file) {
                const folder =
                    youtubeLink ?? image.youtubeLink ? 'youtube' : 'general';
                if (image.imageUrl) await this.s3Service.deleteFile(image.imageUrl);
                image.imageUrl = await this.s3Service.uploadFile(file, folder);
            }
            image.description = description ?? image.description;
            image.youtubeLink = youtubeLink ?? image.youtubeLink;
            image.youtubeDescription = youtubeDescription ?? image.youtubeDescription;
            return await this.imageRepository.save(image);
        } catch (error) {
            if (
                error instanceof NotFoundException ||
                error instanceof BadRequestException
            )
                throw error;
            console.error(`Error updating image ${id}:`, error);
            throw new InternalServerErrorException('Failed to update image');
        }
    }

    async deleteImage(id: number): Promise<void> {
        try {
            const image = await this.imageRepository.findOneBy({ id });
            if (!image) throw new NotFoundException(`Image ${id} not found`);
            if (image.imageUrl) await this.s3Service.deleteFile(image.imageUrl);
            await this.imageRepository.remove(image);
        } catch (error) {
            if (error instanceof NotFoundException) throw error;
            console.error(`Error deleting image ${id}:`, error);
            throw new InternalServerErrorException('Failed to delete image');
        }
    }

    async getImagesWithYoutubeLinks(): Promise<Image[]> {
        try {
            return await this.imageRepository.find({
                where: { youtubeLink: Not(IsNull()) },
                order: { createdAt: 'DESC' },
            });
        } catch (error) {
            console.error('Error fetching YouTube images:', error);
            throw new InternalServerErrorException(
                'Failed to fetch YouTube images'
            );
        }
    }

    private isValidYouTubeUrl(url: string): boolean {
        const pattern = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+$/;
        return pattern.test(url);
    }
}
