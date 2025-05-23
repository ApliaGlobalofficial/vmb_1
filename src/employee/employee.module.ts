import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EmployeeService } from './employee.service';
import { EmployeeController } from './employee.controller';
import { Category } from '../categories/entities/categories.entity'; // Import Category entity
import { Subcategory } from '../subcategories/entities/subcategories.entity'; // Import Subcategory entity
import { Employee } from './entitities/employee.entity';

@Module({
    imports: [
        TypeOrmModule.forFeature([Employee, Category, Subcategory]), // Include Category and Subcategory
    ],
    controllers: [EmployeeController],
    providers: [EmployeeService],
    exports: [EmployeeService],
})
export class EmployeeModule { }