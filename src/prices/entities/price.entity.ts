import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('price')
export class Price {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    category_id: number;

    @Column()
    subcategory_id: number;

    @Column('decimal', { precision: 10, scale: 2 })
    amount: number;

    @CreateDateColumn({ type: 'timestamp' })
    created_at: Date;

    @Column('decimal', { precision: 10, scale: 2, nullable: true })
distributable_amount?: number;


}
