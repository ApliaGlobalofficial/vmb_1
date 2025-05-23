import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('contact_info')
export class ContactInfo {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: 'varchar', length: 255 })
    email: string;

    @Column({ type: 'varchar', length: 20 })
    phone: string;

    @Column({ type: 'varchar', length: 500 })
    address: string;

    @Column({ type: 'text', nullable: true })
    description: string | null;  // description can be nullable
}
