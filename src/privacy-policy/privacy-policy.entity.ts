import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

export enum PolicyType {
    TERMS_AND_CONDITIONS = 'Terms and Conditions',
    PRIVACY_POLICY = 'Privacy Policy',
    RETURN_POLICY = 'Return Policy',
}

@Entity()
export class PrivacyPolicy {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: 'varchar', nullable: true })
    policyFileUrl: string;

    @Column({
        type: 'enum',
        enum: PolicyType,
        nullable: false,
    })
    policyType: PolicyType;

    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    createdAt: Date;
}
