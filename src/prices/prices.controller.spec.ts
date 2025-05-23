import { Test, TestingModule } from '@nestjs/testing';
import { PricesController } from './prices.controller';
import { PricesService } from './prices.service';
import { Price } from './entities/price.entity';

describe('PricesController', () => {
    let controller: PricesController;
    let service: Partial<PricesService>;

    beforeEach(async () => {
        service = {
            create: jest.fn(),
            findAll: jest.fn(),
            findOne: jest.fn(),
            replace: jest.fn(),
            remove: jest.fn(),
        };

        const module: TestingModule = await Test.createTestingModule({
            controllers: [PricesController],
            providers: [{ provide: PricesService, useValue: service }],
        }).compile();

        controller = module.get<PricesController>(PricesController);
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });

    it('POST /prices calls service.create', () => {
        const dto = { category_id: 1, subcategory_id: 2, amount: 50 };
        controller.create(dto);
        expect(service.create).toHaveBeenCalledWith(dto);
    });

    it('GET /prices calls service.findAll', () => {
        controller.findAll();
        expect(service.findAll).toHaveBeenCalled();
    });

    it('GET /prices/:id calls service.findOne', () => {
        controller.findOne(3);
        expect(service.findOne).toHaveBeenCalledWith(3);
    });

    it('PUT /prices/:id calls service.replace', () => {
        const dto = { category_id: 3, subcategory_id: 5, amount: 75 };
        controller.replace(4, dto);
        expect(service.replace).toHaveBeenCalledWith(4, dto);
    });

    it('DELETE /prices/:id calls service.remove', () => {
        controller.remove(5);
        expect(service.remove).toHaveBeenCalledWith(5);
    });
});
