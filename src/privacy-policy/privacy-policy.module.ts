import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PrivacyPolicy } from './privacy-policy.entity';
import { PrivacyPolicyService } from './privacy-policy.service';
import { PrivacyPolicyController } from './privacy-policy.controller';
import { S3Service } from './s3.service';

@Module({
    imports: [TypeOrmModule.forFeature([PrivacyPolicy])],
    controllers: [PrivacyPolicyController],
    providers: [PrivacyPolicyService, S3Service],
})
export class PrivacyPolicyModule { }