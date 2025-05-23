// src/razorpay/razorpay.module.ts
import { Module, forwardRef } from '@nestjs/common';
import { RazorpayService } from './razorpay.service';
import { WalletModule } from '../wallet/wallet.module';
import { AuthModule } from '../auth/auth.module';
import { PaymentController } from './razorpay.controller';

@Module({
    imports: [
        forwardRef(() => WalletModule),
        AuthModule,
    ],
    providers: [RazorpayService],
    controllers: [PaymentController],
    exports: [RazorpayService],
})
export class RazorpayModule { }
