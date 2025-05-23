import { Test, TestingModule } from '@nestjs/testing';
import { RequestErrorsService } from './request-errors.service';

describe('RequestErrorsService', () => {
  let service: RequestErrorsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RequestErrorsService],
    }).compile();

    service = module.get<RequestErrorsService>(RequestErrorsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
