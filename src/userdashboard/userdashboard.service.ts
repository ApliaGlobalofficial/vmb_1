import { Injectable, InternalServerErrorException,NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Document } from '../documents/entities/documents.entity';

@Injectable()
export class UserDashboardService {
  constructor(
    @InjectRepository(Document)
    private readonly documentRepository: Repository<Document>,
  ) {}

  // Fetch documents where status is 'Pending'
  async fetchPendingDocuments(userId: number): Promise<Document[]> {
    try {
      return await this.documentRepository.find({
        where: { user_id: userId, status: 'Pending' },
      });
    } catch (error) {
      console.error('❌ Error fetching pending documents:', error.message);
      throw new InternalServerErrorException('Failed to fetch pending documents');
    }
  }

  // Fetch documents where status is 'Completed'
  async fetchCompletedDocuments(userId: number): Promise<Document[]> {
    try {
      return await this.documentRepository.find({
        where: { user_id: userId, status: 'Completed' },
      });
    } catch (error) {
      console.error('❌ Error fetching completed documents:', error.message);
      throw new InternalServerErrorException('Failed to fetch completed documents');
    }
  }

  // Count total applied applications for a user
  // async getTotalAppliedApplications(userId: number): Promise<{ totalCount: number }> {
  //   try {
  //     const totalCount = await this.documentRepository.count({ where: { user_id: userId } });
  //     return { totalCount };
  //   } catch (error) {
  //     console.error('❌ Error fetching total applied applications:', error);
  //     throw new InternalServerErrorException('Could not fetch total applied applications');
  //   }
  // }

  // Count total completed applications for a user
  // async getTotalCompletedApplications(userId: number): Promise<{ totalCompleted: number }> {
  //   try {
  //     const totalCompleted = await this.documentRepository.count({
  //       where: { user_id: userId, status: 'Completed' },
  //     });

  //     return { totalCompleted };
  //   } catch (error) {
  //     console.error('❌ Error fetching total completed applications:', error);
  //     throw new InternalServerErrorException('Could not fetch completed applications count');
  //   }
  // }





  async getTotalAppliedApplications(userId: number): Promise<{ totalCount: number }> {
    try {
      const totalCount = await this.documentRepository.count({ where: { user_id: userId } });
      return { totalCount };
    } catch (error) {
      console.error('❌ Error fetching total applied applications:', error);
      throw new InternalServerErrorException('Could not fetch total applied applications');
    }
  }





  async getTotalCompletedApplications(userId: number): Promise<{ totalCompleted: number }> {
    try {
      const totalCompleted = await this.documentRepository.count({
        where: { user_id: userId, status: 'Completed' },
      });
  
      return { totalCompleted };
    } catch (error) {
      console.error('❌ Error fetching total completed applications:', error);
      throw new InternalServerErrorException('Could not fetch completed applications count');
    }
  }




  async getCategoryCounts(userId: number): Promise<{ category: string; totalApplications: number }[]> {
    try {
      const categoryCounts = await this.documentRepository
        .createQueryBuilder('document')
        .select('document.category_name', 'category')
        .addSelect('COUNT(document.document_id)', 'totalApplications') // Counting document_id instead of id
        .where('document.user_id = :userId', { userId })
        .groupBy('document.category_name')
        .getRawMany();
  
      return categoryCounts.map(({ category, totalApplications }) => ({
        category,
        totalApplications: Number(totalApplications),
      }));
    } catch (error) {
      console.error('❌ Error fetching category counts:', error);
      throw new InternalServerErrorException('Could not fetch category counts');
    }
  }



  async getDocumentStatusCount(userId: number) {
    return await this.documentRepository
      .createQueryBuilder('document')
      .select('document.status', 'status')
      .addSelect('COUNT(document.document_id)', 'count') // ✅ Correct column name
      .where('document.user_id = :userId', { userId })
      .groupBy('document.status')
      .getRawMany();
  }



  async findByUserAndApplicationId(user_id: number, application_id: string): Promise<Document | null> {
    return await this.documentRepository.findOne({
      where: { user_id, application_id },
    });
  }






 
}
   


