import { Module } from '@nestjs/common';
import { SingleDocumentService } from './singledocument.service';
import { SingleDocumentController } from './singledocument.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Document } from '../documents/entities/documents.entity'; // Assuming your document entity path

@Module({
  imports: [TypeOrmModule.forFeature([Document])],
  controllers: [SingleDocumentController],
  providers: [SingleDocumentService],
})
export class SingleDocumentModule {}
