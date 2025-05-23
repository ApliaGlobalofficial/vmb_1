// src/news/news.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Header } from './header.entity';

interface CreateNewsDto { description: string; }
interface UpdateNewsDto { description: string; }

@Injectable()
export class HeaderService {
    constructor(
        @InjectRepository(Header)
        private readonly repo: Repository<Header>,
    ) { }

    create(dto: CreateNewsDto): Promise<Header> {
        const news = this.repo.create(dto);
        return this.repo.save(news);
    }

    findAll(): Promise<Header[]> {
        return this.repo.find({ order: { createdAt: 'DESC' } });
    }

    async findOne(id: number): Promise<Header> {
        const news = await this.repo.findOne({ where: { id } });
        if (!news) throw new NotFoundException('News not found');
        return news;
    }

    async update(id: number, dto: UpdateNewsDto): Promise<Header> {
        const news = await this.findOne(id);
        news.description = dto.description;
        return this.repo.save(news);
    }

    async remove(id: number): Promise<void> {
        const news = await this.findOne(id);
        await this.repo.remove(news);
    }
}
