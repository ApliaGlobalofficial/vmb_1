// src/razorpay/payment.controller.ts
import {
    Controller, Get, Post, Query,
    Req, Res, UseGuards, Body,           // ← add this

    BadRequestException, HttpCode, Logger,
    NotFoundException
} from '@nestjs/common';
import { Request, Response } from 'express';
import { createHmac } from 'crypto';
import { JwtAuthGuard } from '../jwt-auth/jwt-auth.guard';
import { WalletService } from '../wallet/wallet.service';
import { getEnvVar } from '../utils/env';

@Controller('payment')
export class PaymentController {
    private readonly logger = new Logger(PaymentController.name);

    constructor(private readonly wallet: WalletService) { }


    @UseGuards(JwtAuthGuard)
    @Get('initiate')
    async initiate(@Req() req: Request, @Query('amount') amtStr: string) {
        const userId = (req.user as any).userId;
        const amount = Number(amtStr);
        if (isNaN(amount) || amount <= 0) {
            throw new BadRequestException('Invalid amount');
        }
        // WalletService will record the request, create the tx, and call Razorpay under the hood
        return this.wallet.initiateTopup(userId, amount);
    }
    @UseGuards(JwtAuthGuard)
    @Get('status')
    async status(@Query('merchantOrderId') merchantOrderId: string) {
        if (!merchantOrderId) {
            throw new BadRequestException('merchantOrderId is required');
        }

        const tx = await this.wallet.findTransactionByMerchantOrderId(
            merchantOrderId,
        );
        if (!tx) {
            throw new NotFoundException('Transaction not found');
        }

        return {
            state: tx.status,
            amount: Math.round(tx.amount * 100),
            paymentDetails: tx.paymentDetails || [],
        };
    }


    @Post('callback')
    @HttpCode(200)
    async callback(
        @Body()
        p: {
            merchantOrderId: string
            razorpay_order_id: string
            razorpay_payment_id: string
            razorpay_signature: string
            state: string
            amount: number   // ₹ already
            paymentDetails: any[]
        },
    ) {
        // 1) Validate fields
        if (
            !p.merchantOrderId ||
            !p.razorpay_order_id ||
            !p.razorpay_payment_id ||
            !p.razorpay_signature ||
            !p.state
        ) {
            throw new BadRequestException('Missing fields in callback')
        }

        // 2) Verify signature
        const hmac = createHmac('sha256', getEnvVar('RAZORPAY_KEY_SECRET'))
        hmac.update(`${p.razorpay_order_id}|${p.razorpay_payment_id}`)
        if (hmac.digest('hex') !== p.razorpay_signature) {
            this.logger.error('Invalid Razorpay signature', p.razorpay_signature)
            throw new BadRequestException('Invalid signature')
        }

        // 3) Credit the wallet in ₹
        await this.wallet.creditFromCallback({
            merchantOrderId: p.merchantOrderId,
            transactionId: p.razorpay_payment_id,
            state: p.state,
            amount: p.amount,
            paymentDetails: p.paymentDetails,
        })

        return 'OK'
    }
}