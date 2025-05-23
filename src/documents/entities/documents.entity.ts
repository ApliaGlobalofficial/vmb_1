import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('documents')
export class Document {
  @PrimaryGeneratedColumn()
  document_id: number;

  @Column({ type: 'int', nullable: false })
  user_id: number;

  @Column({ type: 'int', nullable: false })
  category_id: number;

  @Column({ type: 'varchar', length: 255, nullable: false })
  category_name: string;

  @Column({ type: 'int', nullable: false })
  subcategory_id: number;

  @Column({ type: 'varchar', length: 255, nullable: false })
  subcategory_name: string;

  @Column({ type: 'varchar', length: 255, nullable: false })
  name: string;

  @Column({ type: 'varchar', length: 255, nullable: false })
  email: string;

  @Column({ type: 'varchar', length: 20, nullable: false })
  phone: string;

  @Column({ type: 'text', nullable: true })
  address: string;

  // @Column('json', { nullable: false })
  // documents: { document_type: string; file_path: string }[];

  @Column('json', { nullable: false })
  documents: {
    is_receipt_url: any; document_type: string; mimetype: string; file_path: string
  }[];


  @Column({
    type: 'enum',
    enum: ['Pending', 'Approved', 'Rejected', 'Uploaded', 'Completed', 'Sent', 'Received'],
    default: 'Pending',
  })
  status: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  distributor_id: string | null;

  @CreateDateColumn()
  uploaded_at: Date;


  // @UpdateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
  // updated_at: Date;

  // @Column({ type: 'json', nullable: true })
  // status_history: Array<{ status: string; changed_at: Date }>;
  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  status_updated_at: Date; // New field to store the timestamp of the last status update

  @Column('json', { nullable: true }) // Remove the default value
  status_history: Array<{ status: string; updated_at: Date }>;

  @Column('json', { nullable: false })
  document_fields: Record<string, string | number>;

  // ✅ Unique application ID (Now handled in service)
  @Column({ type: 'varchar', length: 50, unique: true })
  application_id: string;


  @Column({ type: 'text', nullable: true })
  remark: string;

  @Column({ nullable: true }) // Allow null for documents without receipts
  receipt_url: string;

  @Column({ type: 'text', nullable: true }) // Allow null values
  rejection_reason: string | null;

  @Column({ type: 'json', nullable: true }) // Allow null values
  selected_document_names: string[] | null;
}

