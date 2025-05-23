import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Document } from '../documents/entities/documents.entity';
import { UserDashboardController } from './userdashboard.controller';
import { UserDashboardService } from './userdashboard.service';

@Module({
  imports: [TypeOrmModule.forFeature([Document])],
  controllers: [UserDashboardController],
  providers: [UserDashboardService],
  exports: [UserDashboardService],
})
export class UserDashboardModule {}
