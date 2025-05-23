import { Injectable, NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Employee } from './entitities/employee.entity';

@Injectable()
export class EmployeeService {
    constructor(
        @InjectRepository(Employee)
        private employeeRepository: Repository<Employee>,
    ) { }

    async findAll(): Promise<Employee[]> {
        return this.employeeRepository.find();
    }

    async findOne(id: number): Promise<Employee> {
        const employee = await this.employeeRepository.findOne({ where: { id } });
        if (!employee) {
            throw new NotFoundException(`Employee with ID ${id} not found`);
        }
        return employee;
    }

    async createList(
        categoryId: number,
        subcategoryIds: number[],
        userId: number,
    ): Promise<Employee[]> {
        try {
            // Create documents for each subcategory
            const documents = subcategoryIds.map(subcategoryId =>
                this.employeeRepository.create({
                    category_id: categoryId,
                    subcategory_id: subcategoryId,
                    user_id: userId,
                })
            );

            // Save all documents at once
            await this.employeeRepository.save(documents);

            return documents;
        } catch (error) {
            console.error('Error in create service:', error);
            throw new InternalServerErrorException('Failed to create documents.');
        }
    }

    async updateList(
        id: number,
        categoryId: number,
        subcategoryIds: number[],
        userId: number,
    ): Promise<Employee[]> {
        try {
            // Check if employee exists
            const existingEmployee = await this.employeeRepository.findOne({ where: { id } });
            if (!existingEmployee) {
                throw new NotFoundException(`Employee with ID ${id} not found`);
            }

            // Delete existing employee(s)
            await this.employeeRepository.delete({ id });

            // Create documents for each subcategory
            const documents = subcategoryIds.map(subcategoryId =>
                this.employeeRepository.create({
                    id,
                    category_id: categoryId,
                    subcategory_id: subcategoryId,
                    user_id: userId,
                })
            );

            // Save all documents at once
            await this.employeeRepository.save(documents);

            return documents;
        } catch (error) {
            console.error('Error in update service:', error);
            throw new InternalServerErrorException('Failed to update employee.');
        }
    }

    async remove(id: number): Promise<void> {
        const result = await this.employeeRepository.delete(id);
        if (result.affected === 0) {
            throw new NotFoundException(`Employee with ID ${id} not found`);
        }
    }
}