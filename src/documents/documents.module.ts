import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DocumentsService } from './documents.service';
import { DocumentsController } from './documents.controller';
import { Document } from './entities/documents.entity';
import { S3Service } from './s3.service';

@Module({
  imports: [TypeOrmModule.forFeature([Document])],
  providers: [DocumentsService, S3Service],
  controllers: [DocumentsController],
})
export class DocumentsModule { }
