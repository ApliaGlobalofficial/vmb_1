// src/phonepe/phonepe.controller.ts

import {
    Controller,
    Get,
    Post,
    Query,
    Headers,
    Req,
    Res,
    UseGuards,
    BadRequestException,
    HttpCode,
    Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { PhonePeService } from './phonepe.service';
import { WalletService } from '../wallet/wallet.service';
import { JwtAuthGuard } from '../jwt-auth/jwt-auth.guard';

@Controller('payment')
export class PhonePeController {
    private readonly logger = new Logger(PhonePeController.name);

    constructor(
        private readonly phonePe: PhonePeService,
        private readonly walletService: WalletService,
    ) { }

    /**
     * GET /api/payment/initiate?amount=…
     */
    @UseGuards(JwtAuthGuard)
    @Get('initiate')
    async initiate(@Req() req: Request, @Query('amount') amountStr: string) {
        const userId = (req.user as any).userId;
        const amount = Number(amountStr);
        if (isNaN(amount) || amount <= 0) {
            throw new BadRequestException('Invalid amount');
        }
        this.logger.log(`Initiating topup for user ${userId}, ₹${amount}`);
        return this.walletService.initiateTopup(userId, amount);
    }

    /**
     * GET /api/payment/status?merchantOrderId=…
     */
    @UseGuards(JwtAuthGuard)
    @Get('status')
    async status(@Query('merchantOrderId') id: string) {
        if (!id) {
            throw new BadRequestException('merchantOrderId is required');
        }
        this.logger.log(`Polling status for order ${id}`);
        return this.phonePe.getStatus(id);
    }

    /**
     * POST /api/payment/callback
     * (No auth guard)
     */
    @Post('callback')
    @HttpCode(200)
    async callback(@Req() req: Request, @Res() res: Response) {
        // Grab either { payload: { … } } or raw body
        const p: any = req.body.payload ?? req.body;

        // Basic validation
        if (!p.merchantOrderId || !p.transactionId || !p.state) {
            return res.status(400).send('Missing fields in callback');
        }

        await this.walletService.creditFromCallback({
            merchantOrderId: p.merchantOrderId,
            transactionId: p.transactionId,
            state: p.state,
            amount: p.amount ?? 0,       // ← already in ₹ from frontend
            paymentDetails: p.paymentDetails ?? [], // ← full details in ₹ from frontend
        });

        return res.send('OK');
    }
}