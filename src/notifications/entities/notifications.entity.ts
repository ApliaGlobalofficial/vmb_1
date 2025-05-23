import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('notifications')
export class Notification {
  @PrimaryGeneratedColumn()
  notification_id: number; // Auto-incremented Primary Key

  @Column({ nullable: true })
  distributor_notification: string;

  @Column({ nullable: true })
  customer_notification: string;

  @Column({ default: 'Active' })
  notification_status: 'Active' | 'Inactive';

  @CreateDateColumn()
  notification_date: Date;
}
