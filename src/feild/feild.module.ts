import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FieldController } from './feild.controller';
import { Field } from './entities/feild.entity';
import { FieldService } from './feild.service';


@Module({
    imports: [TypeOrmModule.forFeature([Field])],
    controllers: [FieldController],
    providers: [FieldService],
})
export class FieldModule { }