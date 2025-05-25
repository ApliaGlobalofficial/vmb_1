import { Module } from '@nestjs/common';
import { WalletDebitService } from './wallet_debit.service';
import { WalletDebitController } from './wallet_debit.controller';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule } from '@nestjs/config';
import { JwtAuthGuard } from '../jwt-auth/jwt-auth.guard';

@Module({
  imports: [
    ConfigModule.forRoot(),
    JwtModule.register({ secret: process.env.JWT_SECRET }),
  ],
  controllers: [WalletDebitController],
  providers: [WalletDebitService, JwtAuthGuard],
})
export class WalletDebitModule {}
