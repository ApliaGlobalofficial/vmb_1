import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn } from 'typeorm';
import { Category } from 'src/categories/entities/categories.entity';
import { Subcategory } from 'src/subcategories/entities/subcategories.entity';
@Entity('requireddocuments')
export class RequiredDocument {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => Category, (category) => category.requiredDocuments, { onDelete: 'CASCADE' })
    category: Category;

    @ManyToOne(() => Subcategory, (subcategory) => subcategory.requiredDocuments, { onDelete: 'CASCADE' })
    subcategory: Subcategory;

    @Column({ type: 'text' }) // Stores document names as a comma-separated string
    document_names: string;

    @CreateDateColumn({ type: 'timestamp' })
    created_at: Date;
    @Column({ type: 'varchar', nullable: true }) // Add this field for file URL
    file_url: string;

}
