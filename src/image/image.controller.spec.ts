// image.controller.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { ImageController } from './image.controller';
import { ImageService } from './image.service';

describe('ImageController', () => {
    let controller: ImageController;
    let service: Partial<Record<keyof ImageService, jest.Mock>>;

    beforeEach(async () => {
        service = {
            createImage: jest.fn(),
            getAllImages: jest.fn(),
            getImageById: jest.fn(),
            updateImage: jest.fn(),
            deleteImage: jest.fn(),
        };

        const module: TestingModule = await Test.createTestingModule({
            controllers: [ImageController],
            providers: [{ provide: ImageService, useValue: service }],
        }).compile();

        controller = module.get<ImageController>(ImageController);
    });

    describe('create', () => {
        it('calls service.createImage and returns result', async () => {
            const dto = { description: 'd', youtubeLink: '', youtubeDescription: '' };
            const file = {} as any;
            (service.createImage as jest.Mock).mockResolvedValue('res');

            expect(await controller.create(file, dto)).toBe('res');
            expect(service.createImage).toHaveBeenCalledWith(
                file,
                dto.description,
                dto.youtubeLink,
                dto.youtubeDescription
            );
        });
    });

    describe('findAll', () => {
        it('returns an array of images', async () => {
            (service.getAllImages as jest.Mock).mockResolvedValue([1, 2]);
            expect(await controller.findAll()).toEqual([1, 2]);
        });
    });

    describe('findOne', () => {
        it('returns a single image', async () => {
            (service.getImageById as jest.Mock).mockResolvedValue('img');
            expect(await controller.findOne(1)).toBe('img');
        });

        it('throws NotFoundException when service throws', async () => {
            (service.getImageById as jest.Mock).mockRejectedValue(new NotFoundException());
            await expect(controller.findOne(1)).rejects.toBeInstanceOf(NotFoundException);
        });
    });

    describe('update', () => {
        it('calls service.updateImage and returns result', async () => {
            const dto = { description: 'd', youtubeLink: '', youtubeDescription: '' };
            const file = {} as any;
            (service.updateImage as jest.Mock).mockResolvedValue('upd');

            expect(await controller.update(1, file, dto)).toBe('upd');
            expect(service.updateImage).toHaveBeenCalledWith(
                1,
                file,
                dto.description,
                dto.youtubeLink,
                dto.youtubeDescription
            );
        });
    });

    describe('delete', () => {
        it('calls service.deleteImage and returns success message', async () => {
            (service.deleteImage as jest.Mock).mockResolvedValue(undefined);
            expect(await controller.delete(1)).toEqual({ message: 'Image deleted successfully' });
        });

        it('throws NotFoundException when service throws', async () => {
            (service.deleteImage as jest.Mock).mockRejectedValue(new NotFoundException());
            await expect(controller.delete(1)).rejects.toBeInstanceOf(NotFoundException);
        });
    });
});
