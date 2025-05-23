// src/contact-info/contact-info.controller.spec.ts

import { Test, TestingModule } from '@nestjs/testing';
import { ContactInfoController } from './contact-info.controller';
import { ContactInfoService } from './contact-info.service';
import { ContactInfo } from './entities/contact-info.entity';

describe('ContactInfoController', () => {
    let controller: ContactInfoController;
    let service: ContactInfoService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [ContactInfoController],
            providers: [
                {
                    provide: ContactInfoService,
                    useValue: {
                        create: jest.fn(),
                        findAll: jest.fn(),
                        findOne: jest.fn(),
                        update: jest.fn(),
                        remove: jest.fn(),
                    },
                },
            ],
        }).compile();

        controller = module.get<ContactInfoController>(ContactInfoController);
        service = module.get<ContactInfoService>(ContactInfoService);
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });

    it('should call create method', async () => {
        const contactInfo: ContactInfo = {
            id: 1,
            email: 'test@example.com',
            phone: '+123456789',
            address: '123 Test St',
            description: 'Test description',
        };

        await controller.create(contactInfo);
        expect(service.create).toHaveBeenCalledWith(contactInfo);
    });

    it('should call findAll method', async () => {
        await controller.findAll();
        expect(service.findAll).toHaveBeenCalled();
    });

    it('should call findOne method', async () => {
        const id = 1;
        await controller.findOne(id);
        expect(service.findOne).toHaveBeenCalledWith(id);
    });

    it('should call update method', async () => {
        const id = 1;
        const contactInfo: ContactInfo = {
            id: 1,
            email: 'updated@example.com',
            phone: '+123456789',
            address: '123 Test St',
            description: 'Updated description',
        };
        await controller.update(id, contactInfo);
        expect(service.update).toHaveBeenCalledWith(id, contactInfo);
    });

    it('should call remove method', async () => {
        const id = 1;
        await controller.remove(id);
        expect(service.remove).toHaveBeenCalledWith(id);
    });
});
