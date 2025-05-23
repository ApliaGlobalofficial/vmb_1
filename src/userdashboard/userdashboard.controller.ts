import { Controller, Get, InternalServerErrorException, NotFoundException, Param, ParseIntPipe } from '@nestjs/common';
import { UserDashboardService } from './userdashboard.service';

@Controller('userdashboard')
export class UserDashboardController {
  constructor(private readonly userDashboardService: UserDashboardService) {}

  @Get('pending/:userId')
  async fetchPendingDocuments(@Param('userId', ParseIntPipe) userId: number) {
    return this.userDashboardService.fetchPendingDocuments(userId);
  }

  @Get('completed/:userId')
  async fetchCompletedDocuments(@Param('userId', ParseIntPipe) userId: number) {
    return this.userDashboardService.fetchCompletedDocuments(userId);
  }



  // @Get('count/applied/:userId')
  // async getTotalAppliedApplications(@Param('userId', ParseIntPipe) userId: number) {
  //   return this.userDashboardService.getTotalAppliedApplications(userId);
  // }

  // @Get('count/completed/:userId')
  // async getTotalCompletedApplications(@Param('userId', ParseIntPipe) userId: number) {
  //   return this.userDashboardService.getTotalCompletedApplications(userId);
  // }



  @Get('total-applied/:userId')
  async getTotalAppliedApplications(@Param('userId', ParseIntPipe) userId: number) {
    return this.userDashboardService.getTotalAppliedApplications(userId);
  }



  @Get('total-completed/:userId')
  async getTotalCompletedApplications(@Param('userId', ParseIntPipe) userId: number) {
    return this.userDashboardService.getTotalCompletedApplications(userId);
  }


  @Get('category-counts/:userId')
  async getCategoryCounts(@Param('userId', ParseIntPipe) userId: number) {
    return this.userDashboardService.getCategoryCounts(userId);
  }




  @Get('status-count/:userId')
  async getStatusCount(@Param('userId') userId: number) {
    return this.userDashboardService.getDocumentStatusCount(userId);
  }





  @Get('fetch/:user_id/:application_id')
  async getDocumentByUserAndAppId(
    @Param('user_id') user_id: number,
    @Param('application_id') application_id: string,
  ) {
    const document = await this.userDashboardService.findByUserAndApplicationId(user_id, application_id);

    if (!document) {
      throw new NotFoundException('No document found for this user and application ID');
    }

    return document;
  }



}



