import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, CreateDateColumn, JoinColumn } from 'typeorm';
import { Category } from '../../categories/entities/categories.entity';
import { RequiredDocument } from '../../required-documents/required-document.entity';

@Entity('subcategories') // Standard table naming
export class Subcategory {
  @PrimaryGeneratedColumn()
  subcategory_id: number;

  @Column({ type: 'varchar', length: 255, nullable: false })
  subcategory_name: string;

  @ManyToOne(() => Category, (category) => category.subcategories, { onDelete: 'CASCADE', nullable: false })
  @JoinColumn({ name: 'category_id' }) // Explicit foreign key column
  category: Category;

  @OneToMany(() => RequiredDocument, (requiredDocument) => requiredDocument.subcategory)
  requiredDocuments: RequiredDocument[];

  @CreateDateColumn({ type: 'timestamp' })
  created_at: Date;
    id: any;
}
