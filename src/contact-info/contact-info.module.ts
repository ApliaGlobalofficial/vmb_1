// src/contact-info/contact-info.module.ts

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ContactInfoController } from './contact-info.controller';
import { ContactInfoService } from './contact-info.service';
import { ContactInfo } from './entities/contact-info.entity';

@Module({
    imports: [TypeOrmModule.forFeature([ContactInfo])],
    controllers: [ContactInfoController],
    providers: [ContactInfoService],
})
export class ContactInfoModule { }
