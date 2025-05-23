import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, UserRole } from 'src/users/entities/users.entity';
import { Category } from 'src/categories/entities/categories.entity';
import { Subcategory } from 'src/subcategories/entities/subcategories.entity';
import { Document } from 'src/documents/entities/documents.entity';

@Injectable()
export class StatisticsService {
    constructor(
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,

        @InjectRepository(Document)
        private readonly documentRepository: Repository<Document>,

        @InjectRepository(Category)
        private readonly categoryRepository: Repository<Category>,

        @InjectRepository(Subcategory)
        private readonly subcategoryRepository: Repository<Subcategory>,
    ) { }

    /**
     * Get counts of documents per category and subcategory.
     * Optimized with indexing and caching suggestions.
     */
    async getsandcCounts() {
        const [categoryCounts, subcategoryCounts, pendingCategoryCounts, pendingSubcategoryCounts] = await Promise.all([
            // Total counts for categories
            this.documentRepository
                .createQueryBuilder('document')
                .select('document.category_name', 'categoryName')
                .addSelect('COUNT(document.document_id)', 'documentCount')
                .groupBy('document.category_name')
                .getRawMany(),

            // Total counts for subcategories
            this.documentRepository
                .createQueryBuilder('document')
                .select('document.subcategory_name', 'subcategoryName')
                .addSelect('COUNT(document.document_id)', 'documentCount')
                .groupBy('document.subcategory_name')
                .getRawMany(),

            // Pending counts for categories
            this.documentRepository
                .createQueryBuilder('document')
                .select('document.category_name', 'categoryName')
                .addSelect('COUNT(document.document_id)', 'pendingCount')
                .where('document.status = :status', { status: 'pending' }) // Assuming 'pending' is the status for pending documents
                .groupBy('document.category_name')
                .getRawMany(),

            // Pending counts for subcategories
            this.documentRepository
                .createQueryBuilder('document')
                .select('document.subcategory_name', 'subcategoryName')
                .addSelect('COUNT(document.document_id)', 'pendingCount')
                .where('document.status = :status', { status: 'pending' }) // Assuming 'pending' is the status for pending documents
                .groupBy('document.subcategory_name')
                .getRawMany(),
        ]);

        return {
            categoryCounts,
            subcategoryCounts,
            pendingCategoryCounts,
            pendingSubcategoryCounts,
        };
    }
    /**
     * Get statistics for a specific distributor.
     * Optimized by combining multiple queries into a single query.
     */
    async getPendingCounts(distributorId: number) {
        try {
            const [
                pendingCategoryCounts,
                pendingSubcategoryCounts,
            ] = await Promise.all([
                this.documentRepository
                    .createQueryBuilder('document')
                    .select('document.category_name', 'categoryName')
                    .addSelect('COUNT(document.document_id)', 'pendingCount')
                    .where('document.status = :status', { status: 'approved' })
                    .andWhere('document.distributor_id = :distributorId', { distributorId })
                    .groupBy('document.category_name')
                    .getRawMany(),

                this.documentRepository
                    .createQueryBuilder('document')
                    .select('document.subcategory_name', 'subcategoryName')
                    .addSelect('COUNT(document.document_id)', 'pendingCount')
                    .where('document.status = :status', { status: 'approved' })
                    .andWhere('document.distributor_id = :distributorId', { distributorId })
                    .groupBy('document.subcategory_name')
                    .getRawMany(),
            ]);

            return {
                pendingCategoryCounts,
                pendingSubcategoryCounts,
            };
        } catch (error) {
            throw new InternalServerErrorException('Error fetching pending counts');
        }
    }
    async getDistributorStatistics(distributorId: number) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const todayDate = today.toISOString().split('T')[0];

        const results = await this.documentRepository
            .createQueryBuilder('documents')
            .select([
                'COUNT(documents.document_id) AS totalDocuments',
                'documents.status AS status',
                'COUNT(DISTINCT documents.user_id) AS totalUsers',
                'COUNT(DISTINCT CASE WHEN documents.status IN (:...completedStatuses) THEN documents.user_id END) AS totalCompletedCertifiedUsers',
                'DATE_FORMAT(documents.uploaded_at, "%Y-%m-%d") AS date',
                'COUNT(DISTINCT CASE WHEN DATE_FORMAT(documents.uploaded_at, "%Y-%m-%d") = :todayDate THEN documents.user_id END) AS dailyUsers',
                'COUNT(DISTINCT CASE WHEN documents.status IN (:...completedStatuses) AND DATE_FORMAT(documents.uploaded_at, "%Y-%m-%d") = :todayDate THEN documents.user_id END) AS dailyCompletedCertifiedUsers',
            ])
            .where('documents.distributor_id = :distributorId', { distributorId })
            .setParameters({
                todayDate,
                completedStatuses: ['completed', 'certified'],
            })
            .groupBy('documents.status, DATE_FORMAT(documents.uploaded_at, "%Y-%m-%d")')
            .getRawMany();

        const aggregatedResults = results.reduce((acc, result) => {
            acc.totalDocuments = result.totalDocuments;
            acc.totalUsers = result.totalUsers;
            acc.totalCompletedCertifiedUsers = result.totalCompletedCertifiedUsers;
            acc.dailyUsers = result.dailyUsers;
            acc.dailyCompletedCertifiedUsers = result.dailyCompletedCertifiedUsers;

            if (!acc.statusCounts) acc.statusCounts = [];
            acc.statusCounts.push({ status: result.status, count: result.totalDocuments });

            if (!acc.dailyStatusCounts) acc.dailyStatusCounts = [];
            acc.dailyStatusCounts.push({ date: result.date, status: result.status, count: result.totalDocuments });

            return acc;
        }, {});

        return {
            distributorId,
            ...aggregatedResults,
        };
    }

    /**
     * Get counts for users, distributors, documents, categories, and subcategories.
     * Optimized using `Promise.all` for concurrent queries.
     */
    async getCounts() {
        const [userCount, distributorCount, documentCount, categoryCount, subcategoryCount] = await Promise.all([
            this.userRepository.count(),
            this.userRepository.count({ where: { role: UserRole.DISTRIBUTOR } }),
            this.documentRepository.count(),
            this.categoryRepository.count(),
            this.subcategoryRepository.count(),
        ]);

        const [
            categoryWiseCounts,
            documentStatusCounts,
            dailyDocumentStatusCounts,
            dailyDocumentCounts,
            dailyUserCount,
            dailyCategoryCount,
            dailySubcategoryCount,
        ] = await Promise.all([
            this.documentRepository
                .createQueryBuilder('document')
                .select('document.category_name', 'categoryName')
                .addSelect('COUNT(document.document_id)', 'documentCount')
                .groupBy('document.category_name')
                .getRawMany(),

            this.documentRepository
                .createQueryBuilder('document')
                .select('document.status', 'status')
                .addSelect('COUNT(document.document_id)', 'count')
                .groupBy('document.status')
                .getRawMany(),

            this.documentRepository
                .createQueryBuilder('document')
                .select('DATE(document.uploaded_at)', 'date')
                .addSelect('document.status', 'status')
                .addSelect('COUNT(document.document_id)', 'count')
                .groupBy('DATE(document.uploaded_at), document.status')
                .getRawMany(),

            this.documentRepository
                .createQueryBuilder('document')
                .select('DATE(document.uploaded_at)', 'date')
                .addSelect('COUNT(document.document_id)', 'count')
                .groupBy('DATE(document.uploaded_at)')
                .getRawMany(),

            this.userRepository
                .createQueryBuilder('user')
                .select('DATE(user.created_at)', 'date')
                .addSelect('COUNT(user.user_id)', 'count')
                .groupBy('DATE(user.created_at)')
                .getRawMany(),

            this.categoryRepository
                .createQueryBuilder('category')
                .select('DATE(category.created_at)', 'date')
                .addSelect('COUNT(category.category_id)', 'count')
                .groupBy('DATE(category.created_at)')
                .getRawMany(),

            this.subcategoryRepository
                .createQueryBuilder('subcategory')
                .select('DATE(subcategory.created_at)', 'date')
                .addSelect('COUNT(subcategory.subcategory_id)', 'count')
                .groupBy('DATE(subcategory.created_at)')
                .getRawMany(),
        ]);

        return {
            totalCounts: {
                users: userCount,
                distributors: distributorCount,
                documents: documentCount,
                categories: categoryCount,
                subcategories: subcategoryCount,
                documentStatus: documentStatusCounts,
            },
            categoryWiseCounts,
            dailyCounts: {
                documents: dailyDocumentCounts,
                users: dailyUserCount,
                categories: dailyCategoryCount,
                subcategories: dailySubcategoryCount,
                documentStatus: dailyDocumentStatusCounts,
            },
        };
    }
}