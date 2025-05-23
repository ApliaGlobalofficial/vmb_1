// image.service.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { ImageService } from './image.service';
import { Image } from './image.entity';
import { S3Service } from './s3.service';

describe('ImageService', () => {
    let service: ImageService;
    let repo: Repository<Image>;
    let s3: S3Service;

    const mockRepo = {
        save: jest.fn(),
        find: jest.fn(),
        findOneBy: jest.fn(),
        remove: jest.fn(),
    };
    const mockS3 = {
        uploadFile: jest.fn(),
        deleteFile: jest.fn(),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                ImageService,
                { provide: getRepositoryToken(Image), useValue: mockRepo },
                { provide: S3Service, useValue: mockS3 },
            ],
        }).compile();

        service = module.get<ImageService>(ImageService);
        repo = module.get<Repository<Image>>(getRepositoryToken(Image));
        s3 = module.get<S3Service>(S3Service);
        jest.clearAllMocks();
    });

    describe('createImage', () => {
        it('throws BadRequestException if no file', async () => {
            await expect(service.createImage(null as any)).rejects.toBeInstanceOf(BadRequestException);
        });

        it('uploads and saves image', async () => {
            const file = { originalname: 'test.jpg' } as any;
            mockS3.uploadFile.mockResolvedValue('url');
            mockRepo.save.mockResolvedValue({ id: 1, imageUrl: 'url' } as Image);

            const result = await service.createImage(file, 'desc', 'https://youtu.be/123', 'ytdesc');
            expect(mockS3.uploadFile).toHaveBeenCalledWith(file, 'youtube');
            expect(mockRepo.save).toHaveBeenCalled();
            expect(result).toHaveProperty('id', 1);
        });
    });

    describe('getAllImages', () => {
        it('returns images', async () => {
            const images = [{ id: 1 }] as Image[];
            mockRepo.find.mockResolvedValue(images);
            expect(await service.getAllImages()).toBe(images);
        });
    });

    describe('getImageById', () => {
        it('throws NotFoundException if not found', async () => {
            mockRepo.findOneBy.mockResolvedValue(null);
            await expect(service.getImageById(1)).rejects.toBeInstanceOf(NotFoundException);
        });

        it('returns image if found', async () => {
            const image = { id: 1 } as Image;
            mockRepo.findOneBy.mockResolvedValue(image);
            expect(await service.getImageById(1)).toBe(image);
        });
    });

    describe('updateImage', () => {
        it('throws NotFoundException if image not exist', async () => {
            mockRepo.findOneBy.mockResolvedValue(null);
            await expect(service.updateImage(1)).rejects.toBeInstanceOf(NotFoundException);
        });
        // further update tests can be added here
    });

    describe('deleteImage', () => {
        it('throws NotFoundException if not found', async () => {
            mockRepo.findOneBy.mockResolvedValue(null);
            await expect(service.deleteImage(1)).rejects.toBeInstanceOf(NotFoundException);
        });

        it('deletes file and entity', async () => {
            const image = { id: 1, imageUrl: 'url' } as Image;
            mockRepo.findOneBy.mockResolvedValue(image);
            mockRepo.remove.mockResolvedValue(null);

            await service.deleteImage(1);
            expect(mockS3.deleteFile).toHaveBeenCalledWith('url');
            expect(mockRepo.remove).toHaveBeenCalledWith(image);
        });
    });
});
