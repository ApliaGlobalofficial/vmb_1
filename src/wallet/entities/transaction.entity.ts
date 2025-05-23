import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    JoinColumn,
    CreateDateColumn,
} from 'typeorm';
import { Wallet } from './wallet.entity';

export type TransactionType = 'CREDIT' | 'DEBIT';
@Entity({ name: 'wallet_transaction' })
export class WalletTransaction {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => Wallet, (w) => w.transactions, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'wallet_id' })
    wallet: Wallet;

    @Column({ name: 'merchant_order_id', type: 'varchar', nullable: true })
    merchantOrderId: string | null;



    @Column({
        name: 'transaction_id',
        type: 'varchar',
        nullable: true,
        unique: true,         // ← ensure uniqueness
    })
    transactionId: string | null;


    @Column({ type: 'enum', enum: ['CREDIT', 'DEBIT'] })
    type: TransactionType;

    @Column('decimal', { precision: 12, scale: 2 })
    amount: number;

    @Column({ length: 32 })
    status: string;

    // ← new JSON column to hold the full PhonePe response
    @Column('json', { name: 'payment_details', nullable: true })
    paymentDetails: any;

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;
}
