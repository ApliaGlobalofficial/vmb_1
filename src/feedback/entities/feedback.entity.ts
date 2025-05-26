import { User } from 'src/users/entities/users.entity';
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne } from 'typeorm';

@Entity('feedback')
export class Feedback {
    @PrimaryGeneratedColumn()
    feedback_id: number;

    @Column()
    comment: string;

    @Column({ type: 'int', default: 5 })
    rating: number;

    @Column()
    user_id: number;  // Store user ID
    // ← new flag
    @Column({ type: 'tinyint', default: false })
    status: number;

    @ManyToOne(() => User, (users) => users.feedbacks) // ✅ Many feedbacks belong to one user
    user: User;
    @CreateDateColumn({ type: 'timestamp' })
    created_at: Date;
}
