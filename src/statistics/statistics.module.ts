import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StatisticsService } from './statistics.service';
import { StatisticsController } from './statistics.controller';
import { User } from 'src/users/entities/users.entity';
import { Document } from 'src/documents/entities/documents.entity';
import {
    Category

} from 'src/categories/entities/categories.entity';
import { Subcategory } from 'src/subcategories/entities/subcategories.entity';

@Module({
    imports: [TypeOrmModule.forFeature([User, Document, Category, Subcategory])],
    providers: [StatisticsService], // ✅ Services should be in "providers"
    controllers: [StatisticsController],
    exports: [StatisticsService], // ✅ Export service if used in other modules
})
export class StatisticsModule { }
