import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WalletRequestService } from './wallet_request.service';
import { WalletRequestController } from './wallet_request.controller';
import { WalletRequest } from './entities/wallet_request.entity';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [TypeOrmModule.forFeature([WalletRequest]), AuthModule],
  controllers: [WalletRequestController],
  providers: [WalletRequestService],
  exports: [WalletRequestService],
})
export class WalletRequestModule {}
