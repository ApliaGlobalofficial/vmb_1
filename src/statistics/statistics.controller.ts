import { BadRequestException, Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import { StatisticsService } from './statistics.service';

@Controller('api/statistics')
export class StatisticsController {
    constructor(private readonly statisticsService: StatisticsService) { }

    @Get('cscounts')
    async getsandcCounts() {
        return this.statisticsService.getsandcCounts();
    }
    @Get('counts')
    async getCounts() {
        return this.statisticsService.getCounts();
    }
    @Get('distributor-counts/:distributorId')
    async getDistributorCounts(@Param('distributorId') distributorId: number) {
        return await this.statisticsService.getDistributorStatistics(distributorId);
    }
    @Get('pending-counts/:distributorId')
    async getPendingCounts(@Param('distributorId', ParseIntPipe) distributorId: number) {
        if (!distributorId || distributorId <= 0) {
            throw new BadRequestException('Invalid distributor ID');
        }
        return await this.statisticsService.getPendingCounts(distributorId);
    }
}

