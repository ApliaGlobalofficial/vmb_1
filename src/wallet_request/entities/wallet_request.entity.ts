import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity({ name: 'wallet_request' })
export class WalletRequest {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    user_id: number;

    @Column({ length: 30, nullable: true })
    account_number: string;

    @Column({ length: 20, nullable: true })
    ifsc_code: string;

    @Column('decimal', { precision: 10, scale: 2, nullable: true })
    requested_amount: number;

    @Column({ type: 'date', nullable: true })
    requested_amount_date: string;

    @Column({ type: 'date', nullable: true })
    sent_amount_date: string;

    @Column({
        type: 'enum',
        enum: ['Pending', 'Approved', 'Rejected', 'Uploaded', 'Completed', 'Sent', 'Received'],
        default: 'Pending',
    })
    status: string;
}
