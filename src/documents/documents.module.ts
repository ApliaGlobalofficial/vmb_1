import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DocumentsService } from './documents.service';
import { DocumentsController } from './documents.controller';
import { Document } from './entities/documents.entity';
import { S3Service } from './s3.service';
import { PricesModule } from '../prices/prices.module';
import { WalletModule } from 'src/wallet/wallet.module';

@Module({
  imports: [TypeOrmModule.forFeature([Document]), PricesModule, WalletModule],
  providers: [DocumentsService, S3Service],
  controllers: [DocumentsController],

})
export class DocumentsModule { }
