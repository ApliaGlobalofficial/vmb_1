// src/phonepe/phonepe.service.ts

import { Injectable } from '@nestjs/common';
import {
    StandardCheckoutClient,
    Env,
    StandardCheckoutPayRequest,
    OrderStatusResponse,
    CallbackResponse,
} from 'pg-sdk-node';
import { getEnvVar } from '../utils/env';

@Injectable()
export class PhonePeService {
    private client: StandardCheckoutClient;

    constructor() {
        const clientId = getEnvVar('PHONEPE_CLIENT_ID');
        const clientSecret = getEnvVar('PHONEPE_CLIENT_SECRET');
        const version = parseInt(getEnvVar('PHONEPE_CLIENT_VERSION'), 10);
        const envName = getEnvVar('NODE_ENV');
        const env = envName === 'production' ? Env.PRODUCTION : Env.SANDBOX;

        this.client = StandardCheckoutClient.getInstance(
            clientId,
            clientSecret,
            version,
            env,
        );
    }

    /**
     * Create a checkout session; PhonePe expects amount in *paise*
     */
    async createCheckout(
        merchantOrderId: string,
        amount: number, // in rupees
    ): Promise<{ checkoutUrl: string; merchantOrderId: string }> {
        const redirectUrl = `${getEnvVar('FRONTEND_URL')}/payment-status?merchantOrderId=${encodeURIComponent(merchantOrderId)}`;

        const req = StandardCheckoutPayRequest.builder()
            .merchantOrderId(merchantOrderId)
            .amount(amount * 100) // convert ₹ → paise
            .redirectUrl(redirectUrl)
            .build();

        const resp = await this.client.pay(req);

        return {
            checkoutUrl: resp.redirectUrl,
            merchantOrderId,
        };
    }

    /**
     * Poll PhonePe for the current order status
     */
    async getStatus(
        merchantOrderId: string,
    ): Promise<OrderStatusResponse> {
        return this.client.getOrderStatus(merchantOrderId);
    }

    /**
     * Validate an incoming callback from PhonePe
     */
    validateCallback(
        authHeader: string,
        rawBody: string,
    ): CallbackResponse {
        return this.client.validateCallback(
            getEnvVar('PHONEPE_CLIENT_ID'),
            getEnvVar('PHONEPE_CLIENT_SECRET'),
            authHeader,
            rawBody,
        );
    }
}
