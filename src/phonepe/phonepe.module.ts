import { Module, forwardRef } from '@nestjs/common';
import { PhonePeService } from './phonepe.service';
import { PhonePeController } from './phonepe.controller';

import { WalletModule } from '../wallet/wallet.module';
import { AuthModule } from '../auth/auth.module';  // ← import AuthModule

@Module({
    imports: [
        forwardRef(() => WalletModule), // for WalletService circular
        AuthModule,                     // ← so AuthGuard('jwt') works here too
    ],
    providers: [PhonePeService],
    controllers: [PhonePeController],
    exports: [PhonePeService],
})
export class PhonePeModule { }
