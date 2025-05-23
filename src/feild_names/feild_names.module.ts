import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FeildNamesService } from './feild_names.service';
import { FeildNamesController } from './feild_names.controller';
import { FeildName } from './entities/feild_names.entity';
import { Category } from 'src/categories/entities/categories.entity';
import { Subcategory } from 'src/subcategories/entities/subcategories.entity';

@Module({
    imports: [TypeOrmModule.forFeature([FeildName, Category, Subcategory])],
    controllers: [FeildNamesController],
    providers: [FeildNamesService],
})
export class FeildNamesModule { }
