// src/wallet/wallet.module.ts
import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { WalletService } from './wallet.service';
import { WalletController } from './wallet.controller';
import { Wallet } from './entities/wallet.entity';
import { WalletTopupRequest } from './entities/topup-request.entity';
import { WalletTransaction } from './entities/transaction.entity';

import { RazorpayModule } from '../razorpay/razorpay.module';
import { AuthModule } from '../auth/auth.module';

@Module({
    imports: [
        TypeOrmModule.forFeature([Wallet, WalletTopupRequest, WalletTransaction]),
        forwardRef(() => RazorpayModule),
        AuthModule,
    ],
    providers: [WalletService],
    controllers: [WalletController],
    exports: [WalletService],
})
export class WalletModule { }
