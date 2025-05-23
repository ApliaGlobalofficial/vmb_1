// src/sms/sms.controller.ts
import { Controller, Post, Body } from '@nestjs/common';
import { SmsService } from './sms.service';
import { SendSmsDto } from './dto/send-sms.dto';

@Controller('sms')
export class SmsController {
    constructor(private readonly sms: SmsService) { }

    @Post('send')
    async sendSms(@Body() dto: SendSmsDto) {
        return this.sms.sendMessage(dto);
    }
}
