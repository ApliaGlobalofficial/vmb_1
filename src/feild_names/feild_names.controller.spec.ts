import { Test, TestingModule } from '@nestjs/testing';
import { FeildNamesController } from './feild_names.controller';
import { FeildNamesService } from './feild_names.service';

describe('FeildNamesController', () => {
    let controller: FeildNamesController;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [FeildNamesController],
            providers: [FeildNamesService],
        }).compile();

        controller = module.get<FeildNamesController>(FeildNamesController);
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });
});
