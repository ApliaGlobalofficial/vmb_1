import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DocumentTypesService } from './document-types.service';
import { DocumentTypesController } from './document-types.controller';
import { DocumentType } from './entities/document-type/document-type.entity.';
@Module({
  imports: [TypeOrmModule.forFeature([DocumentType])], // ✅ Ensure Entity is Registered
  providers: [DocumentTypesService],
  controllers: [DocumentTypesController],
  exports: [DocumentTypesService], // ✅ Export if needed in other modules
})
export class DocumentTypesModule { }
