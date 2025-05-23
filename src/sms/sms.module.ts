// src/sms/sms.module.ts

import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { SmsService } from './sms.service';
import { SmsController } from './sms.controller';

@Module({
    imports: [
        // so ConfigService is available here
        ConfigModule,

        // bring in HttpService with your LiveOne settings
        HttpModule.registerAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: (cfg: ConfigService) => ({
                baseURL: cfg.get<string>('LIVEONE_BASE_URL'),
                headers: { 'Content-Type': 'application/json' },
            }),
        }),
    ],
    providers: [SmsService],
    controllers: [SmsController],
})
export class SmsModule { }
