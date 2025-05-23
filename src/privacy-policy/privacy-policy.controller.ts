// privacy-policy.controller.ts
import {
    Controller,
    Post,
    Put,
    Delete,
    Get,
    Param,
    Body,
    UploadedFile,
    UseInterceptors,
    ParseIntPipe,
    NotFoundException,
    InternalServerErrorException,
    BadRequestException,
    ParseEnumPipe,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { PrivacyPolicyService } from './privacy-policy.service';
import { PolicyType } from './privacy-policy.entity';
import { Express } from 'express';

@Controller('privacy-policy')
export class PrivacyPolicyController {
    constructor(private readonly privacyPolicyService: PrivacyPolicyService) { }

    @Post()
    @UseInterceptors(FileInterceptor('file'))
    async create(
        @UploadedFile() file: Express.Multer.File,
        @Body('policyType') policyType: PolicyType,
    ) {
        if (!file) {
            throw new BadRequestException('No file uploaded.');
        }
        if (!Object.values(PolicyType).includes(policyType)) {
            throw new BadRequestException('Invalid policyType');
        }
        try {
            return await this.privacyPolicyService.create(file, policyType);
        } catch (error) {
            console.error('Error in create controller:', error);
            throw new InternalServerErrorException('Failed to create privacy policy.');
        }
    }

    @Put(':id')
    @UseInterceptors(FileInterceptor('file'))
    async update(
        @Param('id', ParseIntPipe) id: number,
        @UploadedFile() file: Express.Multer.File,
        @Body('policyType') policyType: PolicyType,
    ) {
        if (!file) {
            throw new BadRequestException('No file uploaded.');
        }
        if (!Object.values(PolicyType).includes(policyType)) {
            throw new BadRequestException('Invalid policyType');
        }
        try {
            return await this.privacyPolicyService.update(id, file, policyType);
        } catch (error) {
            console.error('Error in update controller:', error);
            if (error instanceof NotFoundException) {
                throw error;
            }
            throw new InternalServerErrorException('Failed to update privacy policy.');
        }
    }

    @Get()
    async findAll() {
        try {
            return await this.privacyPolicyService.findAll();
        } catch (error) {
            console.error('Error in findAll controller:', error);
            throw new InternalServerErrorException('Failed to fetch privacy policies.');
        }
    }
    @Get('type/:policyType')
    async findByType(
        @Param('policyType', new ParseEnumPipe(PolicyType))
        policyType: PolicyType,
    ) {
        return this.privacyPolicyService.findByType(policyType);
    }

    @Delete(':id')
    async delete(@Param('id', ParseIntPipe) id: number) {
        try {
            await this.privacyPolicyService.delete(id);
            return { message: 'PrivacyPolicy deleted successfully' };
        } catch (error) {
            console.error('Error in delete controller:', error);
            if (error instanceof NotFoundException) {
                throw error;
            }
            throw new InternalServerErrorException('Failed to delete privacy policy.');
        }
    }
}
