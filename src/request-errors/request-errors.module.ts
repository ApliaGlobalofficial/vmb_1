// request-errors.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RequestErrorsService } from './request-errors.service';
import { RequestErrorsController } from './request-errors.controller';
import { RequestError } from './entities/request-error.entity';
import { S3Service } from './s3.service';

@Module({
  imports: [TypeOrmModule.forFeature([RequestError])],
  providers: [RequestErrorsService, S3Service],
  controllers: [RequestErrorsController],
  exports: [RequestErrorsService],
})
export class RequestErrorsModule {}