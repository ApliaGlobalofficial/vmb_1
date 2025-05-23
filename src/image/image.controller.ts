// src/image/image.controller.ts
import {
    Controller,
    Post,
    Get,
    Put,
    Delete,
    Param,
    UploadedFile,
    UseInterceptors,
    ParseIntPipe,
    Body,
    BadRequestException,
    NotFoundException,
    InternalServerErrorException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ImageService } from './image.service';
import { Express } from 'express';

class CreateImageDto {
    description?: string;
    youtubeLink?: string;
    youtubeDescription?: string;
}

@Controller('images')
export class ImageController {
    constructor(private readonly imageService: ImageService) { }

    @Post()
    @UseInterceptors(FileInterceptor('image'))
    async create(
        @UploadedFile() file: Express.Multer.File,
        @Body() body: CreateImageDto
    ) {
        try {
            return await this.imageService.createImage(
                file,
                body.description,
                body.youtubeLink,
                body.youtubeDescription
            );
        } catch (error) {
            if (
                error instanceof BadRequestException ||
                error instanceof NotFoundException
            ) {
                throw error;
            }
            throw new InternalServerErrorException('Failed to create image');
        }
    }

    @Get()
    async findAll() {
        try {
            return await this.imageService.getAllImages();
        } catch (error) {
            throw new InternalServerErrorException('Failed to fetch images');
        }
    }

    @Get(':id')
    async findOne(@Param('id', ParseIntPipe) id: number) {
        try {
            return await this.imageService.getImageById(id);
        } catch (error) {
            if (error instanceof NotFoundException) {
                throw error;
            }
            throw new InternalServerErrorException('Failed to fetch image');
        }
    }

    @Put(':id')
    @UseInterceptors(FileInterceptor('image'))
    async update(
        @Param('id', ParseIntPipe) id: number,
        @UploadedFile() file: Express.Multer.File,
        @Body() body: CreateImageDto
    ) {
        try {
            return await this.imageService.updateImage(
                id,
                file,
                body.description,
                body.youtubeLink,
                body.youtubeDescription
            );
        } catch (error) {
            if (
                error instanceof BadRequestException ||
                error instanceof NotFoundException
            ) {
                throw error;
            }
            throw new InternalServerErrorException('Failed to update image');
        }
    }

    @Delete(':id')
    async delete(@Param('id', ParseIntPipe) id: number) {
        try {
            await this.imageService.deleteImage(id);
            return { message: 'Image deleted successfully' };
        } catch (error) {
            if (error instanceof NotFoundException) {
                throw error;
            }
            throw new InternalServerErrorException('Failed to delete image');
        }
    }
}
