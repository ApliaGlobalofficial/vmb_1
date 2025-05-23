import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ImageController } from './image.controller';
import { ImageService } from './image.service';
import { Image } from './image.entity';
import { S3Service } from './s3.service';

@Module({
    imports: [
        TypeOrmModule.forFeature([Image]),
    ],
    controllers: [ImageController],
    providers: [ImageService, S3Service],
    exports: [ImageService],
})
export class ImageModule { }
