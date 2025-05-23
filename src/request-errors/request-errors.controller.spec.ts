import { Test, TestingModule } from '@nestjs/testing';
import { RequestErrorsController } from './request-errors.controller';

describe('RequestErrorsController', () => {
  let controller: RequestErrorsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RequestErrorsController],
    }).compile();

    controller = module.get<RequestErrorsController>(RequestErrorsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
