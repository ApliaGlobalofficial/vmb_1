import { Controller, Get, Post, Body, Param, Put, Delete, NotFoundException } from '@nestjs/common';
import { ContactInfoService } from './contact-info.service';
import { ContactInfo } from './entities/contact-info.entity';

@Controller('contact-info')
export class ContactInfoController {
    constructor(private readonly contactInfoService: ContactInfoService) { }

    @Post()
    async create(@Body() contactInfo: ContactInfo) {
        return await this.contactInfoService.create(contactInfo);
    }

    @Get()
    async findAll() {
        return await this.contactInfoService.findAll();
    }

    @Get(':id')
    async findOne(@Param('id') id: number) {
        const contactInfo = await this.contactInfoService.findOne(id);
        if (!contactInfo) {
            throw new NotFoundException(`Contact info with ID ${id} not found`);
        }
        return contactInfo;
    }

    @Put(':id')
    async update(@Param('id') id: number, @Body() contactInfo: ContactInfo) {
        const updatedContactInfo = await this.contactInfoService.update(id, contactInfo);
        if (!updatedContactInfo) {
            throw new NotFoundException(`Contact info with ID ${id} not found`);
        }
        return updatedContactInfo;
    }

    @Delete(':id')
    async remove(@Param('id') id: number) {
        const contactInfo = await this.contactInfoService.findOne(id);
        if (!contactInfo) {
            throw new NotFoundException(`Contact info with ID ${id} not found`);
        }
        await this.contactInfoService.remove(id);
        return { message: 'Deleted successfully' };
    }
}
