import { Test, TestingModule } from '@nestjs/testing';
import { FeedbackService } from './feedback.service';
import { Repository } from 'typeorm';
import { Feedback } from './entities/feedback.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException } from '@nestjs/common';

describe('FeedbackService', () => {
    let service: FeedbackService;
    let repository: Repository<Feedback>;

    const mockRepository = {
        find: jest.fn().mockResolvedValue([{ feedback_id: 1, comment: 'Great!', rating: 5 }]),
        findOne: jest.fn().mockImplementation((id) =>
            Promise.resolve(id === 1 ? { feedback_id: 1, comment: 'Good Service', rating: 4 } : null),
        ),
        create: jest.fn().mockImplementation((feedback) => feedback),
        save: jest.fn().mockImplementation((feedback) => Promise.resolve({ feedback_id: 1, ...feedback })),
        delete: jest.fn().mockImplementation((id) =>
            Promise.resolve(id === 1 ? { affected: 1 } : { affected: 0 }),
        ),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                FeedbackService,
                { provide: getRepositoryToken(Feedback), useValue: mockRepository },
            ],
        }).compile();

        service = module.get<FeedbackService>(FeedbackService);
        repository = module.get<Repository<Feedback>>(getRepositoryToken(Feedback));
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    it('should get all feedbacks', async () => {
        expect(await service.findAll()).toEqual([{ feedback_id: 1, comment: 'Great!', rating: 5 }]);
    });

    it('should get one feedback by ID', async () => {
        expect(await service.findOne(1)).toEqual({ feedback_id: 1, comment: 'Good Service', rating: 4 });
    });

    it('should throw an error if feedback is not found', async () => {
        await expect(service.findOne(99)).rejects.toThrow(NotFoundException);
    });

    it('should create a feedback', async () => {
        expect(await service.create('Excellent service', 5, 1)).toEqual({
            feedback_id: expect.any(Number), // Auto-generated ID
            comment: 'Excellent service',
            rating: 5,
            user_id: 1, // Added user_id
            created_at: expect.any(Date), // Auto-generated timestamp
        });
    });


    it('should update a feedback', async () => {
        expect(await service.update(1, 'Updated comment', 3)).toEqual({
            feedback_id: 1,
            comment: 'Updated comment',
            rating: 3,
        });
    });

    it('should throw an error when updating non-existent feedback', async () => {
        await expect(service.update(99, 'Updated comment', 3)).rejects.toThrow(NotFoundException);
    });

    it('should delete a feedback', async () => {
        await expect(service.delete(1)).resolves.toBeUndefined();
    });

    it('should throw an error when deleting non-existent feedback', async () => {
        await expect(service.delete(99)).rejects.toThrow(NotFoundException);
    });
});
