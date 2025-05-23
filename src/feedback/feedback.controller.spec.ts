import { Test, TestingModule } from '@nestjs/testing';
import { FeedbackController } from './feedback.controller';
import { FeedbackService } from './feedback.service';
describe('FeedbackController', () => {
    let controller: FeedbackController;
    let service: FeedbackService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [FeedbackController],
            providers: [
                {
                    provide: FeedbackService,
                    useValue: {
                        findAll: jest.fn().mockResolvedValue([{ feedback_id: 1, comment: 'Great!', rating: 5 }]),
                        findOne: jest.fn().mockImplementation((id) =>
                            Promise.resolve({ feedback_id: id, comment: 'Good Service', rating: 4 }),
                        ),
                        create: jest.fn().mockImplementation((comment, rating) =>
                            Promise.resolve({ feedback_id: 1, comment, rating }),
                        ),
                        update: jest.fn().mockImplementation((id, comment, rating) =>
                            Promise.resolve({ feedback_id: id, comment, rating }),
                        ),
                        delete: jest.fn().mockResolvedValue(undefined),
                    },
                },
            ],
        }).compile();

        controller = module.get<FeedbackController>(FeedbackController);
        service = module.get<FeedbackService>(FeedbackService);
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });

    it('should get all feedbacks', async () => {
        expect(await controller.getAll()).toEqual([{ feedback_id: 1, comment: 'Great!', rating: 5 }]);
    });

    it('should get one feedback by ID', async () => {
        expect(await controller.getOne(1)).toEqual({ feedback_id: 1, comment: 'Good Service', rating: 4 });
    });

    it('should create a feedback', async () => {
        expect(await controller.create('Excellent service', 5, 1)).toEqual({
            feedback_id: 1,
            comment: 'Excellent service',
            rating: 5,
            user_id: 1, // Added user_id
        });
    });

    it('should update a feedback', async () => {
        expect(await controller.update(1, 'Updated comment', 3)).toEqual({
            feedback_id: 1,
            comment: 'Updated comment',
            rating: 3,
        });
    });

    it('should delete a feedback', async () => {
        await expect(controller.delete(1)).resolves.toBeUndefined();
    });
});
