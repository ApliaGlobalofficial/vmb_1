import { Controller, Get, Post, Put, Delete, Body, Param, ParseIntPipe, ParseArrayPipe, InternalServerErrorException } from '@nestjs/common';
import { EmployeeService } from './employee.service';
import { Employee } from './entitities/employee.entity';
@Controller('employee')
export class EmployeeController {
    constructor(private readonly employeeService: EmployeeService) { }

    @Get()
    async findAll() {
        try {
            return await this.employeeService.findAll();
        } catch (error) {
            console.error('Error in findAll controller:', error);
            throw new InternalServerErrorException('Failed to fetch employees.');
        }
    }

    @Get(':id')
    async findOne(@Param('id', ParseIntPipe) id: number) {
        try {
            return await this.employeeService.findOne(id);
        } catch (error) {
            console.error('Error in findOne controller:', error);
            throw new InternalServerErrorException('Failed to fetch employee.');
        }
    }

    @Post()
    async createList(
        @Body('category_id', ParseIntPipe) categoryId: number,
        @Body('subcategory_ids', new ParseArrayPipe({ items: Number })) subcategoryIds: number[],
        @Body('user_id', ParseIntPipe) userId: number,
    ) {
        try {
            const result = await this.employeeService.createList(
                categoryId,
                subcategoryIds,
                userId,
            );
            return result;
        } catch (error) {
            console.error('Error in create controller:', error);
            throw new InternalServerErrorException('Failed to create documents.');
        }
    }

    @Put(':id')
    async updateList(
        @Param('id', ParseIntPipe) id: number,
        @Body('category_id', ParseIntPipe) categoryId: number,
        @Body('subcategory_ids', new ParseArrayPipe({ items: Number })) subcategoryIds: number[],
        @Body('user_id', ParseIntPipe) userId: number,
    ) {
        try {
            const result = await this.employeeService.updateList(
                id,
                categoryId,
                subcategoryIds,
                userId,
            );
            return result;
        } catch (error) {
            console.error('Error in update controller:', error);
            throw new InternalServerErrorException('Failed to update document.');
        }
    }

    @Delete(':id')
    async remove(@Param('id', ParseIntPipe) id: number) {
        try {
            return await this.employeeService.remove(id);
        } catch (error) {
            console.error('Error in delete controller:', error);
            throw new InternalServerErrorException('Failed to delete employee.');
        }
    }
}