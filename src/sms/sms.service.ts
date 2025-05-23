// src/sms/sms.service.ts

import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import { SendSmsDto } from './dto/send-sms.dto';

@Injectable()
export class SmsService {
    private readonly apiKey: string;

    constructor(
        private readonly http: HttpService,
        private readonly config: ConfigService,
    ) {
        // Load your LiveOne API key from .env
        this.apiKey = this.config.get<string>('LIVEONE_API_KEY')!;
    }

    /**
     * Send an SMS via LiveOne.
     * @param dto.sender  Your LiveOne “from” number (must be one of your device-numbers)
     * @param dto.number  Destination MSISDN(s), pipe-separated: "628812345678|628876543210"
     * @param dto.message The SMS text
     */
    async sendMessage(dto: SendSmsDto): Promise<any> {
        const payload = {
            api_key: this.apiKey,
            sender: dto.sender,
            number: dto.number,
            message: dto.message,
        };

        try {
            // POST /send-message (baseURL is configured in HttpModule)
            const { data } = await firstValueFrom(
                this.http.post('/send-message', payload),
            );
            return data;
        } catch (err: any) {
            // Normalize and rethrow as an HttpException
            const status = err.response?.status || HttpStatus.INTERNAL_SERVER_ERROR;
            const message = err.response?.data || err.message || 'Unknown SMS error';
            throw new HttpException(message, status);
        }
    }
}
