// privacy-policy.service.ts
import {
    Injectable,
    NotFoundException,
    BadRequestException,
    InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PrivacyPolicy, PolicyType } from './privacy-policy.entity';
import { S3Service } from './s3.service';
import { Express } from 'express';

@Injectable()
export class PrivacyPolicyService {
    constructor(
        @InjectRepository(PrivacyPolicy)
        private privacyPolicyRepository: Repository<PrivacyPolicy>,
        private s3Service: S3Service,
    ) { }

    async create(
        file: Express.Multer.File,
        policyType: PolicyType,
    ): Promise<{ privacyPolicy: PrivacyPolicy; fileUrl: string }> {
        if (!file) {
            throw new BadRequestException('No file uploaded.');
        }
        const fileUrl = await this.s3Service.uploadFile(file);

        const privacyPolicy = this.privacyPolicyRepository.create({
            policyFileUrl: fileUrl,
            policyType,
        });
        await this.privacyPolicyRepository.save(privacyPolicy);

        return { privacyPolicy, fileUrl };
    }

    async findAll(): Promise<PrivacyPolicy[]> {
        try {
            return await this.privacyPolicyRepository.find();
        } catch (error) {
            console.error('Error in findAll service:', error);
            throw new InternalServerErrorException('Failed to fetch privacy policies.');
        }
    }
    async findByType(policyType: PolicyType): Promise<PrivacyPolicy[]> {
        try {
            return await this.privacyPolicyRepository.find({
                where: { policyType },
                order: { createdAt: 'DESC' },
            });
        } catch (err) {
            console.error('Error in findByType service:', err);
            throw new InternalServerErrorException('Failed to fetch policies by type.');
        }
    }


    async update(
        id: number,
        file: Express.Multer.File,
        policyType: PolicyType,
    ): Promise<{ privacyPolicy: PrivacyPolicy; fileUrl: string }> {
        const policy = await this.privacyPolicyRepository.findOne({ where: { id } });
        if (!policy) {
            throw new NotFoundException('PrivacyPolicy not found');
        }

        const fileUrl = await this.s3Service.updateFile(policy.policyFileUrl, file);

        policy.policyFileUrl = fileUrl;
        policy.policyType = policyType;
        await this.privacyPolicyRepository.save(policy);

        return { privacyPolicy: policy, fileUrl };
    }

    async delete(id: number): Promise<void> {
        const policy = await this.privacyPolicyRepository.findOne({ where: { id } });
        if (!policy) {
            throw new NotFoundException('PrivacyPolicy not found');
        }
        if (policy.policyFileUrl) {
            await this.s3Service.deleteFile(policy.policyFileUrl);
        }
        await this.privacyPolicyRepository.delete(id);
    }
}
