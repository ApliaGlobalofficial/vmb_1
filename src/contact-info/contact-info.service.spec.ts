// src/contact-info/contact-info.service.spec.ts

import { Test, TestingModule } from '@nestjs/testing';
import { ContactInfoService } from './contact-info.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ContactInfo } from './entities/contact-info.entity';
import { Repository } from 'typeorm';

describe('ContactInfoService', () => {
    let service: ContactInfoService;
    let repository: Repository<ContactInfo>;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                ContactInfoService,
                {
                    provide: getRepositoryToken(ContactInfo),
                    useValue: {
                        create: jest.fn(),
                        save: jest.fn(),
                        find: jest.fn(),
                        findOne: jest.fn(),
                        update: jest.fn(),
                        delete: jest.fn(),
                    },
                },
            ],
        }).compile();

        service = module.get<ContactInfoService>(ContactInfoService);
        repository = module.get<Repository<ContactInfo>>(getRepositoryToken(ContactInfo));
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    it('should call create method', async () => {
        const contactInfo: ContactInfo = {
            id: 1,
            email: 'test@example.com',
            phone: '+123456789',
            address: '123 Test St',
            description: 'Test description',
        };

        jest.spyOn(repository, 'save').mockResolvedValue(contactInfo);

        expect(await service.create(contactInfo)).toBe(contactInfo);
    });

    it('should call findAll method', async () => {
        const contactInfoArray: ContactInfo[] = [
            {
                id: 1,
                email: 'test@example.com',
                phone: '+123456789',
                address: '123 Test St',
                description: 'Test description',
            },
        ];
        jest.spyOn(repository, 'find').mockResolvedValue(contactInfoArray);

        expect(await service.findAll()).toBe(contactInfoArray);
    });

    // Add other tests as needed
});
