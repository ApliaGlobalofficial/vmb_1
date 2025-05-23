import {
    Controller,
    Post,
    Body,
    Put,
    Param,
    Get,
    Delete,
    NotFoundException,
    InternalServerErrorException,
} from '@nestjs/common';
import { ContactService } from './contact.service';
import { Contact } from './contact.entity';

@Controller('contact')
export class ContactController {
    constructor(private readonly contactService: ContactService) { }

    // Add a new contact
    @Post()
    async addContact(
        @Body() data: Record<string, string>, // Extract key-value pairs from the request body
    ): Promise<Contact> {
        try {
            return await this.contactService.addContact(data);
        } catch (error) {
            console.error('Error in addContact controller:', error);
            throw new InternalServerErrorException(error.message || 'Failed to add contact.');
        }
    }

    // Update an existing contact by ID
    @Put(':id')
    async updateContact(
        @Param('id') id: number,
        @Body() data: Record<string, string>, // Extract key-value pairs from the request body
    ): Promise<Contact> {
        try {
            return await this.contactService.updateContact(id, data);
        } catch (error) {
            console.error('Error in updateContact controller:', error);
            if (error instanceof NotFoundException) {
                throw error;
            }
            throw new InternalServerErrorException('Failed to update contact.');
        }
    }

    // Get all contacts
    @Get()
    async getAllContacts(): Promise<Contact[]> {
        try {
            return await this.contactService.getAllContacts();
        } catch (error) {
            console.error('Error in getAllContacts controller:', error);
            throw new InternalServerErrorException('Failed to fetch contacts.');
        }
    }

    // Get a single contact by ID
    @Get(':id')
    async getContactById(@Param('id') id: number): Promise<Contact> {
        try {
            return await this.contactService.getContactById(id);
        } catch (error) {
            console.error('Error in getContactById controller:', error);
            if (error instanceof NotFoundException) {
                throw error;
            }
            throw new InternalServerErrorException('Failed to fetch contact.');
        }
    }

    // Delete a contact by ID
    @Delete(':id')
    async deleteContact(@Param('id') id: number): Promise<{ message: string }> {
        try {
            await this.contactService.deleteContact(id);
            return { message: `Contact with ID "${id}" deleted successfully.` };
        } catch (error) {
            console.error('Error in deleteContact controller:', error);
            if (error instanceof NotFoundException) {
                throw error;
            }
            throw new InternalServerErrorException('Failed to delete contact.');
        }
    }
}