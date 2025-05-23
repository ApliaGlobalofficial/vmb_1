import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
} from 'typeorm';

@Entity({ name: 'wallet_topup_request' })
export class WalletTopupRequest {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ name: 'merchant_order_id', type: 'varchar', unique: true })
    merchantOrderId: string;

    @Column({ name: 'user_id', type: 'int' })
    userId: number;

    @Column('decimal', { precision: 12, scale: 2 })
    amount: number;

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;
}