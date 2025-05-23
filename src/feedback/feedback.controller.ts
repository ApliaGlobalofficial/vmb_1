import { Controller, Get, Post, Patch, Delete, Body, Param, Put, ParseBoolPipe, ParseIntPipe } from '@nestjs/common';
import { FeedbackService } from './feedback.service';
@Controller('feedback')
export class FeedbackController {
    constructor(private readonly feedbackService: FeedbackService) { }

    @Get()
    getAll() {
        return this.feedbackService.findAll();
    }
    // In your controller
    @Patch('status/:id')
    async updateStatus(
        @Param('id', ParseIntPipe) id: number,
        @Body('status', ParseIntPipe) status: number,   // parse as integer
    ): Promise<{ message: string }> {
        return this.feedbackService.updateStatus(id, status);
    }


    @Get(':id')
    getOne(@Param('id') id: number) {
        return this.feedbackService.findOne(id);
    }

    @Post()
    async create(
        @Body('comment') comment: string,
        @Body('rating') rating: number,
        @Body('user_id') user_id: number  // Accept user_id directly
    ) {
        return this.feedbackService.create(comment, rating, user_id);
    }



    @Patch(':id')
    update(@Param('id') id: number, @Body('comment') comment: string, @Body('rating') rating: number) {
        return this.feedbackService.update(id, comment, rating);
    }

    @Delete(':id')
    delete(@Param('id') id: number) {
        return this.feedbackService.delete(id);
    }
}
