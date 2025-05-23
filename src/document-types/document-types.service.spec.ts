import { Test, TestingModule } from '@nestjs/testing';
import { DocumentTypesService } from './document-types.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { DocumentType } from './entities/document-type/document-type.entity.';
describe('DocumentTypesService', () => {
  let service: DocumentTypesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DocumentTypesService,
        {
          provide: getRepositoryToken(DocumentType),
          useValue: {}, // Mock Repository
        },
      ],
    }).compile();

    service = module.get<DocumentTypesService>(DocumentTypesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
