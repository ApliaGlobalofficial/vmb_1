import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Contact } from './contact.entity';

@Injectable()
export class ContactService {
    constructor(
        @InjectRepository(Contact)
        private contactRepository: Repository<Contact>,
    ) { }

    // Add a new contact with multiple key-value pairs
    async addContact(data: Record<string, string>): Promise<Contact> {
        try {
            // Validate input
            if (!data || Object.keys(data).length === 0) {
                throw new Error('Data is required and cannot be empty.');
            }

            // Create and save the new contact record
            const contact = this.contactRepository.create({ data });
            await this.contactRepository.save(contact);
            return contact;
        } catch (error) {
            console.error('Error in addContact service:', error);
            throw new InternalServerErrorException(error.message || 'Failed to add contact.');
        }
    }

    // Update an existing contact by ID
    async updateContact(id: number, data: Record<string, string>): Promise<Contact> {
        try {
            // Find the contact by ID
            const contact = await this.contactRepository.findOne({ where: { id } });
            if (!contact) {
                throw new NotFoundException(`Contact with ID "${id}" not found.`);
            }

            // Update the contact data
            contact.data = data;
            await this.contactRepository.save(contact);
            return contact;
        } catch (error) {
            console.error('Error in updateContact service:', error);
            if (error instanceof NotFoundException) {
                throw error;
            }
            throw new InternalServerErrorException('Failed to update contact.');
        }
    }

    // Get all contacts
    async getAllContacts(): Promise<Contact[]> {
        try {
            return await this.contactRepository.find();
        } catch (error) {
            console.error('Error in getAllContacts service:', error);
            throw new InternalServerErrorException('Failed to fetch contacts.');
        }
    }

    // Get a single contact by ID
    async getContactById(id: number): Promise<Contact> {
        try {
            const contact = await this.contactRepository.findOne({ where: { id } });
            if (!contact) {
                throw new NotFoundException(`Contact with ID "${id}" not found.`);
            }
            return contact;
        } catch (error) {
            console.error('Error in getContactById service:', error);
            if (error instanceof NotFoundException) {
                throw error;
            }
            throw new InternalServerErrorException('Failed to fetch contact.');
        }
    }

    // Delete a contact by ID
    async deleteContact(id: number): Promise<void> {
        try {
            const contact = await this.contactRepository.findOne({ where: { id } });
            if (!contact) {
                throw new NotFoundException(`Contact with ID "${id}" not found.`);
            }

            await this.contactRepository.delete(id);
        } catch (error) {
            console.error('Error in deleteContact service:', error);
            if (error instanceof NotFoundException) {
                throw error;
            }
            throw new InternalServerErrorException('Failed to delete contact.');
        }
    }
}