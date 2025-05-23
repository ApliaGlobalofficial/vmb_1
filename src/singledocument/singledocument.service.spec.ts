import { Test, TestingModule } from '@nestjs/testing';
import { SingledocumentService } from './singledocument.service';

describe('SingledocumentService', () => {
  let service: SingledocumentService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SingledocumentService],
    }).compile();

    service = module.get<SingledocumentService>(SingledocumentService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
