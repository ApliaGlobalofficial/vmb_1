import { Entity, PrimaryGeneratedColumn, ManyToOne, Column, CreateDateColumn } from 'typeorm';
import { Category } from 'src/categories/entities/categories.entity';
import { Subcategory } from 'src/subcategories/entities/subcategories.entity';

@Entity('FeildName') // Table name
export class FeildName {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => Category, (category) => category.requiredDocuments, { onDelete: 'CASCADE' })
    category: Category;

    @ManyToOne(() => Subcategory, (subcategory) => subcategory.requiredDocuments, { onDelete: 'CASCADE' })
    subcategory: Subcategory;

    @Column({ type: 'text', nullable: false })
    document_fields: string; // Now it matches the request body


    @CreateDateColumn({ type: 'timestamp' })
    created_at: Date;
}
