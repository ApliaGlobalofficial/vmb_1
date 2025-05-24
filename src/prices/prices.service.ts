// src/prices/prices.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Price } from './entities/price.entity';

@Injectable()
export class PricesService {
    constructor(
        @InjectRepository(Price)
        private readonly priceRepo: Repository<Price>,
    ) { }

    create(data: {
        category_id: number;
        subcategory_id: number;
        amount: number;
    }): Promise<Price> {
        const price = this.priceRepo.create(data);
        return this.priceRepo.save(price);
    }

    findAll(): Promise<Price[]> {
        return this.priceRepo.find();
    }

    // <-- updated to always return a Price or throw
    async findOne(id: number): Promise<Price> {
        const price = await this.priceRepo.findOneBy({ id });
        if (!price) {
            throw new NotFoundException(`Price with id ${id} not found`);
        }
        return price;
    }

    async replace(
        id: number,
        data: { category_id: number; subcategory_id: number; amount: number },
    ): Promise<Price> {
        // 1) fetch existing (throws 404 if not found)
        const price = await this.findOne(id);

        // 2) overwrite fields
        price.category_id = data.category_id;
        price.subcategory_id = data.subcategory_id;
        price.amount = data.amount;

        // 3) save back to the DB
        return this.priceRepo.save(price);
    }

    async remove(id: number): Promise<void> {
        const result = await this.priceRepo.delete(id);
        if (result.affected === 0) {
            throw new NotFoundException(`Price with id ${id} not found`);
        }
    }


    async findByCatIdAndSubCatId(
        category_id: number,
        subcategory_id: number,
    ): Promise<Price> {
        const price = await this.priceRepo.findOneBy({
            category_id,
            subcategory_id,
        });

        if (!price) {
            throw new NotFoundException(
                `Price with category_id=${category_id} and subcategory_id=${subcategory_id} not found`,
            );
        }
        return price;
    }

}
