// src/news/news.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HeaderController } from './header.controller';
import { HeaderService } from './header.service';
import { Header } from './header.entity';

@Module({
    imports: [TypeOrmModule.forFeature([Header])],
    controllers: [HeaderController],
    providers: [HeaderService],
})
export class HeaderModule { }
