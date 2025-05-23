import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Feedback } from './entities/feedback.entity';

@Injectable()
export class FeedbackService {
    constructor(
        @InjectRepository(Feedback)
        private readonly feedbackRepository: Repository<Feedback>,
    ) { }

    async findAll(): Promise<any[]> {
        return await this.feedbackRepository
            .createQueryBuilder("feedback")
            .leftJoin("users", "users", "users.user_id = feedback.user_id") // Join with 'users' table
            .select([
                "feedback.feedback_id",
                "feedback.comment",
                "feedback.rating",
                "feedback.user_id",
                "feedback.status",
                "users.name",  // Get users.name
                "users.role"   // Get users.role
            ])
            .getRawMany();
    }

    async findOne(id: number): Promise<Feedback> {
        const feedback = await this.feedbackRepository.findOne({ where: { feedback_id: id } });
        if (!feedback) {
            throw new NotFoundException(`Feedback with ID ${id} not found`);
        }
        return feedback;
    }
    async create(comment: string, rating: number, user_id: number): Promise<Feedback> {
        const newFeedback = this.feedbackRepository.create({ comment, rating, user_id });
        return await this.feedbackRepository.save(newFeedback);
    }
    async updateStatus(id: number, status: number): Promise<{ message: string }> {
        const result = await this.feedbackRepository.update(id, { status });
        if (result.affected === 0) {
            throw new NotFoundException(`Feedback #${id} not found`);
        }
        return { message: 'Status updated' };
    }
    async update(id: number, comment: string, rating: number): Promise<Feedback> {
        const feedback = await this.findOne(id);
        feedback.comment = comment;
        feedback.rating = rating;
        return await this.feedbackRepository.save(feedback);
    }

    async delete(id: number): Promise<void> {
        const result = await this.feedbackRepository.delete(id);
        if (result.affected === 0) {
            throw new NotFoundException(`Feedback with ID ${id} not found`);
        }
    }
}
