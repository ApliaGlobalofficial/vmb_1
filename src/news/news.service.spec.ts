// src/news/news.service.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NewsService } from './news.service';
import { News } from './news.entity';

describe('NewsService', () => {
    let service: NewsService;
    let repo: Repository<News>;

    const mockRepo = {
        create: jest.fn(),
        save: jest.fn(),
        find: jest.fn(),
        findOne: jest.fn(),
        remove: jest.fn(),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                NewsService,
                { provide: getRepositoryToken(News), useValue: mockRepo },
            ],
        }).compile();

        service = module.get<NewsService>(NewsService);
        repo = module.get<Repository<News>>(getRepositoryToken(News));
    });

    afterEach(() => jest.clearAllMocks());

    it('creates news', async () => {
        const dto = { description: 'Test' };
        const entity = { id: 1, ...dto } as News;
        mockRepo.create.mockReturnValue(entity);
        mockRepo.save.mockResolvedValue(entity);

        expect(await service.create(dto)).toEqual(entity);
        expect(repo.create).toHaveBeenCalledWith(dto);
        expect(repo.save).toHaveBeenCalledWith(entity);
    });

    it('finds all news', async () => {
        const list = [{ id: 1, description: 'a' }] as News[];
        mockRepo.find.mockResolvedValue(list);

        expect(await service.findAll()).toEqual(list);
        expect(repo.find).toHaveBeenCalled();
    });

    it('finds one existing', async () => {
        const entity = { id: 1, description: 'a' } as News;
        mockRepo.findOne.mockResolvedValue(entity);

        expect(await service.findOne(1)).toEqual(entity);
        expect(repo.findOne).toHaveBeenCalledWith({ where: { id: 1 } });
    });

    it('throws on missing findOne', () => {
        mockRepo.findOne.mockResolvedValue(undefined);
        return expect(service.findOne(1)).rejects.toThrow('News not found');
    });

    it('updates existing', async () => {
        const old = { id: 1, description: 'old' } as News;
        const updated = { id: 1, description: 'new' } as News;
        mockRepo.findOne.mockResolvedValue(old);
        mockRepo.save.mockResolvedValue(updated);

        expect(await service.update(1, { description: 'new' })).toEqual(updated);
        expect(repo.save).toHaveBeenCalledWith({ ...old, description: 'new' });
    });

    it('throws on missing update', () => {
        mockRepo.findOne.mockResolvedValue(undefined);
        return expect(service.update(1, { description: 'x' })).rejects.toThrow('News not found');
    });

    it('removes existing', async () => {
        const entity = { id: 1, description: 'a' } as News;
        mockRepo.findOne.mockResolvedValue(entity);
        mockRepo.remove.mockResolvedValue(undefined);

        await service.remove(1);
        expect(repo.remove).toHaveBeenCalledWith(entity);
    });

    it('throws on missing remove', () => {
        mockRepo.findOne.mockResolvedValue(undefined);
        return expect(service.remove(1)).rejects.toThrow('News not found');
    });
});
