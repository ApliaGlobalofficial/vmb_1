import {
    Controller,
    Post,
    Body,
    Put,
    Param,
    Delete,
    Get,
    NotFoundException,
    InternalServerErrorException,
} from '@nestjs/common';
import { FieldService } from './feild.service';

@Controller('field')
export class FieldController {
    constructor(private readonly fieldService: FieldService) { }

    // Add a new field (key)
    @Post()
    async addField(@Body('key') key: string) {
        try {
            return await this.fieldService.addField(key);
        } catch (error) {
            console.error('Error in addField controller:', error);
            throw new InternalServerErrorException('Failed to add field.');
        }
    }

    // Update an existing field (key)
    @Put(':id')
    async updateField(
        @Param('id') id: number,
        @Body('key') key: string,
    ) {
        try {
            return await this.fieldService.updateField(id, key);
        } catch (error) {
            console.error('Error in updateField controller:', error);
            if (error instanceof NotFoundException) {
                throw error;
            }
            throw new InternalServerErrorException('Failed to update field.');
        }
    }

    // Delete a field by ID
    @Delete(':id')
    async deleteField(@Param('id') id: number) {
        try {
            await this.fieldService.deleteField(id);
            return { message: `Field with ID "${id}" deleted successfully.` };
        } catch (error) {
            console.error('Error in deleteField controller:', error);
            if (error instanceof NotFoundException) {
                throw error;
            }
            throw new InternalServerErrorException('Failed to delete field.');
        }
    }

    // Get all fields (keys)
    @Get()
    async getAllFields() {
        try {
            return await this.fieldService.getAllFields();
        } catch (error) {
            console.error('Error in getAllFields controller:', error);
            throw new InternalServerErrorException('Failed to fetch fields.');
        }
    }
}