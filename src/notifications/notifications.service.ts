import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification } from './entities/notifications.entity';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(Notification)
    private notificationRepo: Repository<Notification>,
  ) {}

  // Create Notification
  async createNotification(data: Partial<Notification>): Promise<Notification> {
    const notification = this.notificationRepo.create(data);
    return this.notificationRepo.save(notification);
  }

  // Get All Notifications
  async getAllNotifications(): Promise<Notification[]> {
    return this.notificationRepo.find();
  }

  // Get Active Notifications
  async getActiveNotifications(): Promise<Notification[]> {
    return this.notificationRepo.find({ where: { notification_status: 'Active' } });
  }

  // Get Notification by ID
  async getNotificationById(id: number): Promise<Notification> {
    const notification = await this.notificationRepo.findOne({ where: { notification_id: id } });
    if (!notification) throw new NotFoundException('Notification not found');
    return notification;
  }

  // Update Notification
  async updateNotification(id: number, data: Partial<Notification>): Promise<Notification> {
    const notification = await this.getNotificationById(id);
    Object.assign(notification, data);
    return this.notificationRepo.save(notification);
  }

  async updateStatus(id: number, notification_status: 'Active' | 'Inactive') {
    const notification = await this.notificationRepo.findOne({ where: { notification_id: id } });

    if (!notification) {
      throw new NotFoundException(`Notification with ID ${id} not found`);
    }

    notification.notification_status = notification_status;
    await this.notificationRepo.save(notification);

    return {
      message: `Notification status updated to ${notification_status}`,
      notification,
    };
  }


  // Delete Notification
  async deleteNotification(id: number): Promise<void> {
    const result = await this.notificationRepo.delete(id);
    if (result.affected === 0) throw new NotFoundException('Notification not found');
  }
}
