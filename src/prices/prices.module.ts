import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PricesService } from './prices.service';
import { PricesController } from './prices.controller';
import { Price } from './entities/price.entity';

@Module({
    imports: [TypeOrmModule.forFeature([Price])],
    providers: [PricesService],
    controllers: [PricesController],
    exports: [PricesService],
    // <-- export PricesService to be used in other modul
})
export class PricesModule { }
