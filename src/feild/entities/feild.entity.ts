import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class Field {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: 'varchar', nullable: false, unique: true }) // Ensure keys are unique
    key: string; // Field name (e.g., "email", "phoneNumber")

    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    createdAt: Date;

    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
    updatedAt: Date;
}