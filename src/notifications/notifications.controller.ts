import { Controller, Get, Post, Body, Param, Put, Delete, Patch } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { Notification } from './entities/notifications.entity';

@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  // Create Notification
  @Post()
  createNotification(@Body() body: Partial<Notification>) {
    return this.notificationsService.createNotification(body);
  }

  // Get All Notifications
  @Get()
  getAllNotifications() {
    return this.notificationsService.getAllNotifications();
  }

  // Get Active Notifications
  @Get('active')
  getActiveNotifications() {
    return this.notificationsService.getActiveNotifications();
  }

  // Get Notification by ID
  @Get(':id')
  getNotificationById(@Param('id') id: number) {
    return this.notificationsService.getNotificationById(id);
  }

  // Update Notification
  @Put(':id')
  updateNotification(@Param('id') id: number, @Body() body: Partial<Notification>) {
    return this.notificationsService.updateNotification(id, body);
  }

  // Update Status (Active/Inactive)
  @Patch('status/:id')
  async updateStatus(
    @Param('id') id: number,
    @Body('notification_status') notification_status: 'Active' | 'Inactive',
  ) {
    return await this.notificationsService.updateStatus(id, notification_status);
  }

  // Delete Notification
  @Delete(':id')
  deleteNotification(@Param('id') id: number) {
    return this.notificationsService.deleteNotification(id);
  }
}
