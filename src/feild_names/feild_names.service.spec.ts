import { Test, TestingModule } from '@nestjs/testing';
import { FeildNamesService } from './feild_names.service';

describe('FeildNamesService', () => {
    let service: FeildNamesService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [FeildNamesService],
        }).compile();

        service = module.get<FeildNamesService>(FeildNamesService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });
});
