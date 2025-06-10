import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  OneToMany,
} from 'typeorm';
import { Feedback } from 'src/feedback/entities/feedback.entity';

export enum UserRole {
  ADMIN = 'Admin',
  DISTRIBUTOR = 'Distributor',
  CUSTOMER = 'Customer',
  EMPLOYEE = 'Employee',
}

export enum LoginStatus {
  ACTIVE = 'Active',
  INACTIVE = 'Inactive',
}


/** Only these three values — no “None” needed */
export enum EditRequestStatus {
  PENDING = 'Pending',
  APPROVED = 'Approved',
  REJECTED = 'Rejected',
}


@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  user_id: number;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'varchar', length: 255, unique: true })
  email: string;

  @Column({ type: 'varchar', length: 255 })
  password: string;

  @Column({ type: 'varchar', length: 15, nullable: true })
  phone?: string | null;

  @Column({ type: 'varchar', length: 500, nullable: true })
  address?: string | null;

  @Column({ type: 'varchar', length: 500, nullable: true })
  shop_address?: string | null;

  @Column({ type: 'enum', enum: UserRole, default: UserRole.CUSTOMER })
  role: UserRole;

  @Column({ type: 'enum', enum: LoginStatus, default: LoginStatus.INACTIVE })
  user_login_status: LoginStatus;


  @CreateDateColumn({
    name: 'created_at',
    type: 'timestamp',
    precision: 6,
    default: () => 'CURRENT_TIMESTAMP(6)',
  })
  created_at: Date;


  @Column({ type: 'varchar', length: 255, nullable: true })

  district?: string | null;


  @Column({ type: 'varchar', length: 255, nullable: true })
  taluka?: string | null;

  @Column({ type: 'simple-json', nullable: true })
  user_documents?: {
    document_type: string;
    mimetype: string;
    file_path: string;
  }[];

  @Column({
    type: 'enum',
    enum: EditRequestStatus,
    nullable: true,  // Allow NULL values
  })
  edit_request_status: EditRequestStatus;

  @Column({ type: 'varchar', length: 255, nullable: true })
  resetToken: string | null;

  @Column({ type: 'timestamp', nullable: true })
  resetTokenExpiration: Date | null;
  @Column({ type: 'varchar', length: 500, nullable: true })
  profile_picture: string | null; // ✅ New profile picture column


  @OneToMany(() => Feedback, (feedback) => feedback.user)
  feedbacks?: Feedback[];

  @Column({ type: 'json', nullable: true })
edit_request_fields?: string[];
}

