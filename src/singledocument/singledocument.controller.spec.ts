import { Test, TestingModule } from '@nestjs/testing';
import { SingledocumentController } from './singledocument.controller';

describe('SingledocumentController', () => {
  let controller: SingledocumentController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SingledocumentController],
    }).compile();

    controller = module.get<SingledocumentController>(SingledocumentController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
