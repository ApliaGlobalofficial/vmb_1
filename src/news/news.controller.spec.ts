// src/news/news.controller.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { NewsController } from './news.controller';
import { NewsService } from './news.service';

describe('NewsController (e2e)', () => {
    let app: INestApplication;

    const mockService = {
        create: jest.fn(dto => ({ id: 1, ...dto })),
        findAll: jest.fn(() => [{ id: 1, description: 'a' }]),
        findOne: jest.fn(id => ({ id, description: 'a' })),
        update: jest.fn((id, dto) => ({ id, ...dto })),
        remove: jest.fn(() => undefined),
    };

    beforeAll(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [NewsController],
            providers: [{ provide: NewsService, useValue: mockService }],
        }).compile();

        app = module.createNestApplication();
        app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
        await app.init();
    });

    afterAll(async () => {
        await app.close();
    });

    it('/POST news', () => {
        return request(app.getHttpServer())
            .post('/news')
            .send({ description: 'a' })
            .expect(201)
            .expect({ id: 1, description: 'a' });
    });

    it('/GET news', () => {
        return request(app.getHttpServer())
            .get('/news')
            .expect(200)
            .expect([{ id: 1, description: 'a' }]);
    });

    it('/GET news/1', () => {
        return request(app.getHttpServer())
            .get('/news/1')
            .expect(200)
            .expect({ id: 1, description: 'a' });
    });

    it('/PUT news/1', () => {
        return request(app.getHttpServer())
            .put('/news/1')
            .send({ description: 'b' })
            .expect(200)
            .expect({ id: 1, description: 'b' });
    });

    it('/DELETE news/1', () => {
        return request(app.getHttpServer())
            .delete('/news/1')
            .expect(200)
            .expect({ message: 'News removed' });
    });
});
