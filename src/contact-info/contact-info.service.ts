import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ContactInfo } from './entities/contact-info.entity';

@Injectable()
export class ContactInfoService {
    constructor(
        @InjectRepository(ContactInfo)
        private contactInfoRepository: Repository<ContactInfo>,
    ) { }

    // Create a new contact info record
    create(contactInfo: ContactInfo): Promise<ContactInfo> {
        const newContactInfo = this.contactInfoRepository.create(contactInfo);
        return this.contactInfoRepository.save(newContactInfo);
    }

    // Get all contact info records
    findAll(): Promise<ContactInfo[]> {
        return this.contactInfoRepository.find();
    }

    // Get a specific contact info record by ID
    async findOne(id: number): Promise<ContactInfo | null> {
        return this.contactInfoRepository.findOne({ where: { id } });
    }

    // Update a specific contact info record
    async update(id: number, contactInfo: ContactInfo): Promise<ContactInfo | null> {
        const existingContactInfo = await this.findOne(id);
        if (!existingContactInfo) {
            return null;  // Return null if not found
        }
        await this.contactInfoRepository.update(id, contactInfo);
        return this.findOne(id); // Fetch the updated record
    }

    // Delete a specific contact info record
    async remove(id: number): Promise<void> {
        await this.contactInfoRepository.delete(id);
    }
}
