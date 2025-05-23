// src/news/news.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { News } from './news.entity';

interface CreateNewsDto { description: string; }
interface UpdateNewsDto { description: string; }

@Injectable()
export class NewsService {
    constructor(
        @InjectRepository(News)
        private readonly repo: Repository<News>,
    ) { }

    create(dto: CreateNewsDto): Promise<News> {
        const news = this.repo.create(dto);
        return this.repo.save(news);
    }

    findAll(): Promise<News[]> {
        return this.repo.find({ order: { createdAt: 'DESC' } });
    }

    async findOne(id: number): Promise<News> {
        const news = await this.repo.findOne({ where: { id } });
        if (!news) throw new NotFoundException('News not found');
        return news;
    }

    async update(id: number, dto: UpdateNewsDto): Promise<News> {
        const news = await this.findOne(id);
        news.description = dto.description;
        return this.repo.save(news);
    }

    async remove(id: number): Promise<void> {
        const news = await this.findOne(id);
        await this.repo.remove(news);
    }
}
