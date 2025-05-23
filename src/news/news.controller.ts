// src/news/news.controller.ts
import {
    Controller,
    Get,
    Post,
    Put,
    Delete,
    Body,
    Param,
    ParseIntPipe,
} from '@nestjs/common';
import { NewsService } from './news.service';
import { News } from './news.entity';

class CreateNewsDto { description: string; }
class UpdateNewsDto { description: string; }

@Controller('news')
export class NewsController {
    constructor(private readonly newsService: NewsService) { }

    @Post()
    create(@Body() dto: CreateNewsDto): Promise<News> {
        return this.newsService.create(dto);
    }

    @Get()
    findAll(): Promise<News[]> {
        return this.newsService.findAll();
    }

    @Get(':id')
    findOne(@Param('id', ParseIntPipe) id: number): Promise<News> {
        return this.newsService.findOne(id);
    }

    @Put(':id')
    update(
        @Param('id', ParseIntPipe) id: number,
        @Body() dto: UpdateNewsDto,
    ): Promise<News> {
        return this.newsService.update(id, dto);
    }

    @Delete(':id')
    async remove(@Param('id', ParseIntPipe) id: number): Promise<{ message: string }> {
        await this.newsService.remove(id);
        return { message: 'News removed' };
    }
}
