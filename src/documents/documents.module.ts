import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DocumentsService } from './documents.service';
import { DocumentsController } from './documents.controller';
import { Document } from './entities/documents.entity';
import { S3Service } from './s3.service';
import { PricesModule } from '../prices/prices.module';
import { WalletModule } from '../wallet/wallet.module';
import { WalletTransaction } from '../wallet/entities/transaction.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Document,WalletTransaction]), PricesModule, WalletModule],
  providers: [DocumentsService, S3Service],
  controllers: [DocumentsController],

})
export class DocumentsModule { }
