import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('documentTypes')
export class DocumentType {
    @PrimaryGeneratedColumn()
    doc_type_id: number;

    @Column({ type: 'varchar', length: 255, unique: true })
    doc_type_name: string;
}
